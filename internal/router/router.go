package router

import (
	"io/fs"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"

	portal "gacfox-portal"
	"gacfox-portal/internal/config"
	"gacfox-portal/internal/handler"
	"gacfox-portal/internal/middleware"
)

// New 构建 gin 引擎：API 路由 + 上传目录 + 前端静态资源（SPA fallback）
func New(h *handler.Handler, cfg *config.Config, jwtSecret string) (*gin.Engine, error) {
	gin.SetMode(cfg.GinMode)
	r := gin.Default()

	api := r.Group("/api")
	{
		api.GET("/status", h.Status)
		api.POST("/init", h.Init)
		api.POST("/login", h.Login)

		authed := api.Group("", middleware.JWTAuth(jwtSecret))
		{
			authed.GET("/site", h.GetSite)
			authed.PUT("/site", h.UpdateSite)

			authed.POST("/categories", h.CreateCategory)
			authed.PUT("/categories/:id", h.UpdateCategory)
			authed.DELETE("/categories/:id", h.DeleteCategory)
			authed.PUT("/categories/:id/move", h.MoveCategory)

			authed.POST("/categories/:id/bookmarks", h.CreateBookmark)
			authed.PUT("/bookmarks/:id", h.UpdateBookmark)
			authed.DELETE("/bookmarks/:id", h.DeleteBookmark)
			authed.PUT("/bookmarks/:id/move", h.MoveBookmark)

			authed.PUT("/widgets", h.ReplaceWidgets)
			authed.POST("/upload", h.Upload)
		}
	}

	// 用户上传的文件（图标、背景图等）
	// CSP 阻止直接打开 SVG 时执行其中脚本（<img> 引用本就不会执行，双保险）
	r.Use(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/uploads/") {
			c.Header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'")
		}
		c.Next()
	})
	r.Static("/uploads", filepath.Join(cfg.DataDir, "uploads"))

	staticFS, err := portal.StaticFS()
	if err != nil {
		return nil, err
	}

	r.NoRoute(spaHandler(staticFS))
	return r, nil
}

// spaHandler 先尝试按路径返回静态文件，未命中则回退 index.html（SPA 前端路由）
func spaHandler(staticFS fs.FS) gin.HandlerFunc {
	return func(c *gin.Context) {
		urlPath := strings.TrimPrefix(c.Request.URL.Path, "/")

		// API 路径返回 JSON 404 而不是 index.html
		if strings.HasPrefix(urlPath, "api/") || urlPath == "api" {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}

		// fs.ValidPath 拒绝含 ".." 等非法元素的路径：
		// embed.FS 本身会拒绝，dev 模式的 os.DirFS 则需此防护避免目录穿越
		if urlPath != "" && fs.ValidPath(urlPath) {
			if data, err := fs.ReadFile(staticFS, urlPath); err == nil {
				serveContent(c, urlPath, data)
				return
			}
		}

		data, err := fs.ReadFile(staticFS, "index.html")
		if err != nil {
			c.String(http.StatusNotFound, "frontend not built: run `npm run build` in frontend/")
			return
		}
		serveContent(c, "index.html", data)
	}
}

func serveContent(c *gin.Context, name string, data []byte) {
	c.Data(http.StatusOK, contentType(name, data), data)
}

// contentType 按扩展名返回常见静态资源 MIME 类型，未知扩展名回退到内容嗅探
func contentType(name string, data []byte) string {
	switch strings.ToLower(filepath.Ext(name)) {
	case ".html":
		return "text/html; charset=utf-8"
	case ".js", ".mjs":
		return "application/javascript; charset=utf-8"
	case ".css":
		return "text/css; charset=utf-8"
	case ".json":
		return "application/json; charset=utf-8"
	case ".svg":
		return "image/svg+xml"
	case ".png":
		return "image/png"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".webp":
		return "image/webp"
	case ".gif":
		return "image/gif"
	case ".ico":
		return "image/x-icon"
	case ".woff":
		return "font/woff"
	case ".woff2":
		return "font/woff2"
	case ".yaml", ".yml":
		return "text/yaml; charset=utf-8"
	default:
		return http.DetectContentType(data)
	}
}
