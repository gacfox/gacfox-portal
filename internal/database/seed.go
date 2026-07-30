package database

import (
	_ "embed"
	"encoding/json"
	"fmt"

	"gopkg.in/yaml.v3"
	"gorm.io/gorm"

	"gacfox-portal/internal/model"
)

// seedYAML 为初始站点数据（来自原纯前端项目的 public/config/site.yaml），
// 在管理员初始化时导入数据库。
//
//go:embed seed/site.yaml
var seedYAML []byte

type seedFile struct {
	Site struct {
		Title      string `yaml:"title"`
		Icon       string `yaml:"icon"`
		Background struct {
			Light string `yaml:"light"`
			Dark  string `yaml:"dark"`
		} `yaml:"background"`
	} `yaml:"site"`
	Widgets   []map[string]any `yaml:"widgets"`
	Bookmarks []struct {
		Category string `yaml:"category"`
		Items    []struct {
			Name        string `yaml:"name"`
			URL         string `yaml:"url"`
			Icon        string `yaml:"icon"`
			Description string `yaml:"description"`
		} `yaml:"items"`
	} `yaml:"bookmarks"`
}

// ImportSeed 将内嵌的 seed/site.yaml 导入数据库，应在初始化管理员后于空库上执行。
func ImportSeed(db *gorm.DB) error {
	var seed seedFile
	if err := yaml.Unmarshal(seedYAML, &seed); err != nil {
		return fmt.Errorf("parse seed yaml: %w", err)
	}

	return db.Transaction(func(tx *gorm.DB) error {
		settings := []model.Setting{
			{Key: "site.title", Value: seed.Site.Title},
			{Key: "site.icon", Value: seed.Site.Icon},
			{Key: "site.background.light", Value: seed.Site.Background.Light},
			{Key: "site.background.dark", Value: seed.Site.Background.Dark},
		}
		if err := tx.Create(&settings).Error; err != nil {
			return err
		}

		for i, w := range seed.Widgets {
			name, _ := w["name"].(string)
			gridWidth, _ := w["gridWidth"].(string)
			if gridWidth == "" {
				gridWidth = "full"
			}
			delete(w, "name")
			delete(w, "gridWidth")

			extra, err := json.Marshal(w)
			if err != nil {
				return fmt.Errorf("marshal widget %s config: %w", name, err)
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

		for i, c := range seed.Bookmarks {
			category := model.Category{Name: c.Category, Sort: i}
			if err := tx.Create(&category).Error; err != nil {
				return err
			}
			for j, item := range c.Items {
				if err := tx.Create(&model.Bookmark{
					CategoryID:  category.ID,
					Name:        item.Name,
					URL:         item.URL,
					Icon:        item.Icon,
					Description: item.Description,
					Sort:        j,
				}).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})
}
