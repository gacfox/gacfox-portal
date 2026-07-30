package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"gacfox-portal/internal/helper"
	"gacfox-portal/internal/model"
)

// ReplaceWidgets PUT /api/widgets — 整体替换小组件列表
// 请求体为数组：[{"name":"time","gridWidth":"half"},{"name":"steam-wishlist","ids":[39]}]
// name/gridWidth 之外的字段存入 Config JSON。
func (h *Handler) ReplaceWidgets(c *gin.Context) {
	var items []map[string]any
	if err := c.ShouldBindJSON(&items); err != nil {
		helper.BadRequest(c, "invalid widget list")
		return
	}

	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&model.Widget{}).Error; err != nil {
			return err
		}
		for i, item := range items {
			name, _ := item["name"].(string)
			if name == "" {
				return errWidgetNameRequired
			}
			gridWidth, _ := item["gridWidth"].(string)
			if gridWidth == "" {
				gridWidth = "full"
			}
			delete(item, "name")
			delete(item, "gridWidth")
			delete(item, "id")

			extra, err := json.Marshal(item)
			if err != nil {
				return err
			}
			if err := tx.Create(&model.Widget{
				Name:      name,
				GridWidth: gridWidth,
				Sort:      i,
				Config:    string(extra),
			}).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		if err == errWidgetNameRequired {
			helper.BadRequest(c, "widget name required")
			return
		}
		helper.InternalError(c, "save widgets failed")
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

var errWidgetNameRequired = errors.New("widget name required")
