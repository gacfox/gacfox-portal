package main

import (
	"fmt"
	"log"

	"gacfox-portal/internal/auth"
	"gacfox-portal/internal/config"
	"gacfox-portal/internal/database"
	"gacfox-portal/internal/handler"
	"gacfox-portal/internal/router"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	db, err := database.Init(cfg.DataDir)
	if err != nil {
		log.Fatalf("init database: %v", err)
	}

	jwtSecret, err := auth.LoadOrCreateSecret(cfg.JWT.Secret, cfg.DataDir)
	if err != nil {
		log.Fatalf("load jwt secret: %v", err)
	}

	h := handler.New(db, cfg, jwtSecret)

	r, err := router.New(h, cfg, jwtSecret)
	if err != nil {
		log.Fatalf("setup router: %v", err)
	}

	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Printf("gacfox-portal listening on %s (data dir: %s)", addr, cfg.DataDir)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server exited: %v", err)
	}
}
