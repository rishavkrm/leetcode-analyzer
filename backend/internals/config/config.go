package config

import (
	"log"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	GeminiConfig GeminiConfig
	ServerConfig ServerConfig
}

// Config holds the configuration for the application
type ServerConfig struct {
	Port           string `json:"port"`
	Mode           string
	AllowedOrigins []string
}

type GeminiConfig struct {
	APIKey     string `json:"gemini_api_key"`
	FlashBig   string `json:"gemini_flash_big"`
	FlashSmall string `json:"gemini_flash_small"`
	BatchSize  int    `json:"gemini_batch_size"`
}

func LoadConfig() (config Config, err error) {
	serverConfig, err := LoadServerConfig()
	if err != nil {
		return config, err
	}
	geminiConfig, err := LoadGeminiConfig()
	if err != nil {
		return config, err
	}
	return Config{
		ServerConfig: *serverConfig,
		GeminiConfig: *geminiConfig,
	}, nil
}

// LoadConfig loads the configuration from a env file
func LoadServerConfig() (*ServerConfig, error) {
	port := LoadFromEnv("PORT", "8080")
	mode := LoadFromEnv("MODE", "DEV")
	allowedOriginsString := LoadFromEnv("ALLOWEDORIGINS", "http://localhost:3000,http://localhost:5173")
	allowedOrigins := strings.Split(allowedOriginsString, ",")
	log.Println("Allowed origins:", allowedOrigins)
	return &ServerConfig{
		Port:           port,
		Mode:           mode,
		AllowedOrigins: allowedOrigins,
	}, nil
}

func LoadGeminiConfig() (*GeminiConfig, error) {
	APIKey := LoadFromEnv("APIKEY", "")
	FlashBig := LoadFromEnv("FLASHBIG", "gemini")
	FlashSmall := LoadFromEnv("FLASHSMALL", "gemini")
	BatchSize := LoadFromEnvInt("BATCHSIZE", 0)
	return &GeminiConfig{
		APIKey:     APIKey,
		FlashBig:   FlashBig,
		FlashSmall: FlashSmall,
		BatchSize:  BatchSize,
	}, nil
}

func LoadFromEnv(env string, defaultValue string) string {
	env, ok := os.LookupEnv(env)
	if !ok {
		log.Println("Could not load " + env + ",using default value")
		return defaultValue
	}
	return env
}

func LoadFromEnvInt(env string, defaultValue int) int {
	env, ok := os.LookupEnv(env)
	if !ok {
		log.Println("Could not load " + env + ",using default value")
		return defaultValue
	}
	envNum, err := strconv.ParseInt(env, 10, 10)
	if err != nil {
		log.Println("Could not load " + env + ",using default value")
		return defaultValue
	}
	return int(envNum)
}
