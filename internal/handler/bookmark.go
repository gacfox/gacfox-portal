package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"gacfox-portal/internal/helper"
	"gacfox-portal/internal/model"
)

type bookmarkRequest struct {
	Name        string `json:"name" binding:"required,min=1,max=128"`
	URL         string `json:"url" binding:"required,min=1,max=512"`
	Icon        string `json:"icon" binding:"max=512"`
	Description string `json:"description" binding:"max=512"`
	CategoryID  uint   `json:"categoryId"` // 可选：变更书签所属分类
}

// CreateBookmark POST /api/categories/:id/bookmarks
func (h *Handler) CreateBookmark(c *gin.Context) {
	var category model.Category
	if err := h.DB.First(&category, c.Param("id")).Error; err != nil {
		helper.NotFound(c, "category not found")
		return
	}

	var req bookmarkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.BadRequest(c, "bookmark name and url required")
		return
	}

	var maxSort int
	h.DB.Model(&model.Bookmark{}).Where("category_id = ?", category.ID).
		Select("COALESCE(MAX(sort), -1)").Scan(&maxSort)

	bookmark := model.Bookmark{
		CategoryID:  category.ID,
		Name:        req.Name,
		URL:         req.URL,
		Icon:        req.Icon,
		Description: req.Description,
		Sort:        maxSort + 1,
	}
	if err := h.DB.Create(&bookmark).Error; err != nil {
		helper.InternalError(c, "create bookmark failed")
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id":          bookmark.ID,
		"name":        bookmark.Name,
		"url":         bookmark.URL,
		"icon":        bookmark.Icon,
		"description": bookmark.Description,
	})
}

// UpdateBookmark PUT /api/bookmarks/:id
func (h *Handler) UpdateBookmark(c *gin.Context) {
	bookmark, ok := h.findBookmark(c)
	if !ok {
		return
	}

	var req bookmarkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.BadRequest(c, "bookmark name and url required")
		return
	}

	updates := map[string]any{
		"name":        req.Name,
		"url":         req.URL,
		"icon":        req.Icon,
		"description": req.Description,
	}

	// 跨分类移动：追加到目标分类末尾
	if req.CategoryID != 0 && req.CategoryID != bookmark.CategoryID {
		var target model.Category
		if err := h.DB.First(&target, req.CategoryID).Error; err != nil {
			helper.BadRequest(c, "target category not found")
			return
		}
		var maxSort int
		h.DB.Model(&model.Bookmark{}).Where("category_id = ?", target.ID).
			Select("COALESCE(MAX(sort), -1)").Scan(&maxSort)
		updates["category_id"] = target.ID
		updates["sort"] = maxSort + 1
	}

	if err := h.DB.Model(bookmark).Updates(updates).Error; err != nil {
		helper.InternalError(c, "update bookmark failed")
		return
	}
	h.CleanupUploads() // 被替换掉的旧图标若不再被引用则删除
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// DeleteBookmark DELETE /api/bookmarks/:id
func (h *Handler) DeleteBookmark(c *gin.Context) {
	bookmark, ok := h.findBookmark(c)
	if !ok {
		return
	}
	if err := h.DB.Delete(bookmark).Error; err != nil {
		helper.InternalError(c, "delete bookmark failed")
		return
	}
	h.CleanupUploads() // 被删书签的图标若不再被引用则删除
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// MoveBookmark PUT /api/bookmarks/:id/move {direction} — 同分类内移动
func (h *Handler) MoveBookmark(c *gin.Context) {
	bookmark, ok := h.findBookmark(c)
	if !ok {
		return
	}
	h.move(c, bookmark.ID, bookmark.Sort, "bookmarks", func(db *gorm.DB) *gorm.DB {
		return db.Where("category_id = ?", bookmark.CategoryID)
	})
}

func (h *Handler) findBookmark(c *gin.Context) (*model.Bookmark, bool) {
	var bookmark model.Bookmark
	if err := h.DB.First(&bookmark, c.Param("id")).Error; err != nil {
		helper.NotFound(c, "bookmark not found")
		return nil, false
	}
	return &bookmark, true
}
