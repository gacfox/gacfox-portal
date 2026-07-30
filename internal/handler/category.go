package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"gacfox-portal/internal/helper"
	"gacfox-portal/internal/model"
)

// CreateCategory POST /api/categories {name}
func (h *Handler) CreateCategory(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required,min=1,max=128"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.BadRequest(c, "category name required")
		return
	}

	var maxSort int
	h.DB.Model(&model.Category{}).Select("COALESCE(MAX(sort), -1)").Scan(&maxSort)

	category := model.Category{Name: req.Name, Sort: maxSort + 1}
	if err := h.DB.Create(&category).Error; err != nil {
		helper.InternalError(c, "create category failed")
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": category.ID, "category": category.Name, "items": []any{}})
}

// UpdateCategory PUT /api/categories/:id {name}
func (h *Handler) UpdateCategory(c *gin.Context) {
	category, ok := h.findCategory(c)
	if !ok {
		return
	}

	var req struct {
		Name string `json:"name" binding:"required,min=1,max=128"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.BadRequest(c, "category name required")
		return
	}

	if err := h.DB.Model(category).Update("name", req.Name).Error; err != nil {
		helper.InternalError(c, "update category failed")
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// DeleteCategory DELETE /api/categories/:id — 级联删除其下书签
func (h *Handler) DeleteCategory(c *gin.Context) {
	category, ok := h.findCategory(c)
	if !ok {
		return
	}

	if err := h.DB.Select("Bookmarks").Delete(category).Error; err != nil {
		helper.InternalError(c, "delete category failed")
		return
	}
	h.CleanupUploads() // 级联删除的书签图标若不再被引用则清理
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// MoveCategory PUT /api/categories/:id/move {direction: "up"|"down"}
func (h *Handler) MoveCategory(c *gin.Context) {
	category, ok := h.findCategory(c)
	if !ok {
		return
	}
	h.move(c, category.ID, category.Sort, "categories")
}

func (h *Handler) findCategory(c *gin.Context) (*model.Category, bool) {
	var category model.Category
	if err := h.DB.First(&category, c.Param("id")).Error; err != nil {
		helper.NotFound(c, "category not found")
		return nil, false
	}
	return &category, true
}

// move 与相邻记录交换 sort。table 限定为 categories / bookmarks，scope 为可选的父级过滤。
func (h *Handler) move(c *gin.Context, id uint, sort int, table string, scope ...func(*gorm.DB) *gorm.DB) {
	var req struct {
		Direction string `json:"direction" binding:"required,oneof=up down"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.BadRequest(c, `direction must be "up" or "down"`)
		return
	}

	neighborQuery := h.DB.Table(table).Select("id, sort")
	for _, s := range scope {
		neighborQuery = s(neighborQuery)
	}
	var neighbor struct {
		ID   uint
		Sort int
	}
	found := true
	if req.Direction == "up" {
		found = neighborQuery.Where("sort < ?", sort).Order("sort DESC").Limit(1).Scan(&neighbor).RowsAffected > 0
	} else {
		found = neighborQuery.Where("sort > ?", sort).Order("sort ASC").Limit(1).Scan(&neighbor).RowsAffected > 0
	}
	if !found {
		c.JSON(http.StatusOK, gin.H{"ok": true}) // 已在边界，视为成功
		return
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Table(table).Where("id = ?", id).Update("sort", neighbor.Sort).Error; err != nil {
			return err
		}
		return tx.Table(table).Where("id = ?", neighbor.ID).Update("sort", sort).Error
	})
	if err != nil {
		helper.InternalError(c, "move failed")
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
