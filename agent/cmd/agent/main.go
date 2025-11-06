package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	log "github.com/sirupsen/logrus"
)

var (
	// Version information (set via ldflags during build)
	Version   = "dev"
	Commit    = "unknown"
	BuildTime = "unknown"
)

func main() {
	// Setup logging
	setupLogger()

	log.WithFields(log.Fields{
		"version":    Version,
		"commit":     Commit,
		"build_time": BuildTime,
	}).Info("Starting HECS Agent")

	// Create context with cancellation
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Setup signal handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Start HTTP server for health checks and metrics
	go startHTTPServer()

	// Main agent loop
	go agentLoop(ctx)

	// Wait for shutdown signal
	<-sigChan
	log.Info("Shutdown signal received, gracefully stopping...")

	// Cancel context and wait for goroutines to finish
	cancel()
	time.Sleep(2 * time.Second)

	log.Info("HECS Agent stopped")
}

func setupLogger() {
	// Set log format
	log.SetFormatter(&log.JSONFormatter{
		TimestampFormat: time.RFC3339,
	})

	// Set log level
	logLevel := os.Getenv("LOG_LEVEL")
	if logLevel == "" {
		logLevel = "info"
	}

	level, err := log.ParseLevel(logLevel)
	if err != nil {
		level = log.InfoLevel
	}
	log.SetLevel(level)

	log.SetOutput(os.Stdout)
}

func startHTTPServer() {
	mux := http.NewServeMux()

	// Health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"healthy","version":"` + Version + `"}`))
	})

	// Readiness check
	mux.HandleFunc("/ready", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ready"}`))
	})

	// Version info
	mux.HandleFunc("/version", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		response := fmt.Sprintf(`{"version":"%s","commit":"%s","build_time":"%s"}`,
			Version, Commit, BuildTime)
		w.Write([]byte(response))
	})

	// Prometheus metrics endpoint
	mux.Handle("/metrics", promhttp.Handler())

	// Start server
	addr := ":8080"
	log.WithField("address", addr).Info("Starting HTTP server")

	server := &http.Server{
		Addr:         addr,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.WithError(err).Fatal("HTTP server failed to start")
	}
}

func agentLoop(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	log.Info("Agent loop started")

	for {
		select {
		case <-ctx.Done():
			log.Info("Agent loop stopped")
			return
		case <-ticker.C:
			// Heartbeat log
			log.WithFields(log.Fields{
				"timestamp": time.Now().Unix(),
				"status":    "running",
			}).Debug("Agent heartbeat")

			// TODO: Implement actual agent logic:
			// - Connect to control plane
			// - Fetch and execute tasks
			// - Report metrics
			// - Handle updates
		}
	}
}
