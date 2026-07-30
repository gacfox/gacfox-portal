package handler

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"

	"gacfox-portal/internal/helper"
	"gacfox-portal/internal/model"
	"gorm.io/gorm"
)

// GetSite GET /api/site — 组装为与原 site.yaml 相同的结构返回（附带记录 id 供编辑模式寻址）
func (h *Handler) GetSite(c *gin.Context) {
	var settings []model.Setting
	if err := h.DB.Find(&settings).Error; err != nil {
		helper.InternalError(c, "query settings failed")
		return
	}
	settingMap := make(map[string]string, len(settings))
	for _, s := range settings {
		settingMap[s.Key] = s.Value
	}

	var widgets []model.Widget
	if err := h.DB.Order("sort").Find(&widgets).Error; err != nil {
		helper.InternalError(c, "query widgets failed")
		return
	}

	var categories []model.Category
	if err := h.DB.Preload("Bookmarks", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort")
	}).Order("sort").Find(&categories).Error; err != nil {
		helper.InternalError(c, "query categories failed")
		return
	}

	widgetList := make([]map[string]any, 0, len(widgets))
	for _, w := range widgets {
		item := map[string]any{
			"id":        w.ID,
			"name":      w.Name,
			"gridWidth": w.GridWidth,
		}
		// Config JSON 展开平铺（如 steam-wishlist 的 ids），与原 yaml extraProps 行为一致
		if w.Config != "" {
			var extra map[string]any
			if err := json.Unmarshal([]byte(w.Config), &extra); err == nil {
				for k, v := range extra {
					item[k] = v
				}
			}
		}
		widgetList = append(widgetList, item)
	}

	categoryList := make([]map[string]any, 0, len(categories))
	for _, cat := range categories {
		items := make([]map[string]any, 0, len(cat.Bookmarks))
		for _, b := range cat.Bookmarks {
			items = append(items, map[string]any{
				"id":          b.ID,
				"name":        b.Name,
				"url":         b.URL,
				"icon":        b.Icon,
				"description": b.Description,
			})
		}
		categoryList = append(categoryList, map[string]any{
			"id":       cat.ID,
			"category": cat.Name,
			"items":    items,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"site": gin.H{
			"title": settingMap["site.title"],
			"icon":  settingMap["site.icon"],
			"background": gin.H{
				"light": settingMap["site.background.light"],
				"dark":  settingMap["site.background.dark"],
			},
		},
		"widgets":   widgetList,
		"bookmarks": categoryList,
	})
}

type updateSiteRequest struct {
	Title      string `json:"title"`
	Icon       string `json:"icon"`
	Background struct {
		Light string `json:"light"`
		Dark  string `json:"dark"`
	} `json:"background"`
}

// UpdateSite PUT /api/site — 更新站点设置（title / icon / 明暗背景）
func (h *Handler) UpdateSite(c *gin.Context) {
	var req updateSiteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		helper.BadRequest(c, "invalid request body")
		return
	}

	pairs := map[string]string{
		"site.title":            req.Title,
		"site.icon":             req.Icon,
		"site.background.light": req.Background.Light,
		"site.background.dark":  req.Background.Dark,
	}
	for k, v := range pairs {
		if err := h.DB.Save(&model.Setting{Key: k, Value: v}).Error; err != nil {
			helper.InternalError(c, "save settings failed")
			return
		}
	}
	h.CleanupUploads() // 旧的背景图/图标若不再被引用则删除
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
