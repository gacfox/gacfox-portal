package config

import (
	"flag"
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Config 应用配置，对应 config/config.*.yaml
type Config struct {
	Server struct {
		Port int `yaml:"port"`
	} `yaml:"server"`
	DataDir string `yaml:"data_dir"`
	JWT     struct {
		Secret      string `yaml:"secret"`
		ExpireHours int    `yaml:"expire_hours"`
	} `yaml:"jwt"`
	GinMode string `yaml:"gin_mode"`
}

// Load 解析 -config 命令行参数并加载 YAML 配置文件。
// 默认加载 config/config.prod.yaml（开发时显式传 -config config/config.dev.yaml）。
func Load() (*Config, error) {
	configPath := flag.String("config", "config/config.prod.yaml", "path to config file")
	flag.Parse()

	data, err := os.ReadFile(*configPath)
	if err != nil {
		return nil, fmt.Errorf("read config file %s: %w", *configPath, err)
	}

	cfg := &Config{}
	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, fmt.Errorf("parse config file %s: %w", *configPath, err)
	}

	if cfg.Server.Port == 0 {
		cfg.Server.Port = 8080
	}
	if cfg.DataDir == "" {
		cfg.DataDir = "./data"
	}
	if cfg.JWT.ExpireHours == 0 {
		cfg.JWT.ExpireHours = 720
	}
	if cfg.GinMode == "" {
		cfg.GinMode = "release"
	}

	return cfg, nil
}
