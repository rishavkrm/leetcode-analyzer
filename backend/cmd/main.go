package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"dsa-helper-backend/internals/auth"
	"dsa-helper-backend/internals/config"
	"dsa-helper-backend/internals/datastore"
	"dsa-helper-backend/internals/handlers"
	"dsa-helper-backend/internals/middlewares"
)

func main() {
	config, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Error loading config:", err)
	}
	firebaseAuthClient, firestoreClient, err := backendAuth.InitializeFirebase(config.ServerConfig.Mode)
	if err != nil {
		log.Println("Error: ", err)
	}
	firestoreDataStore := &datastore.Datastore{
		FirestoreClient: firestoreClient,
	}
	firestoreHandler := handlers.NewFirestoreHandler(firestoreDataStore)
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middlewares.CORSMiddleware(config.ServerConfig.AllowedOrigins))

	r.Post("/register", handlers.GoogleSignInHandler(firebaseAuthClient))

	authenticated := chi.NewRouter()
	authenticated.Use(middlewares.FirebaseAuthMiddleware(firebaseAuthClient))

	// submission analysis routes
	authenticated.Get("/get-submissions", handlers.SubmissionFetchHandler(config.GeminiConfig))
	authenticated.Post("/submission-feedback", firestoreHandler.SubmissionFeedbackHandler(config.GeminiConfig))
	authenticated.Post("/pattern-info", handlers.PatternInfoHandler(config.GeminiConfig))
	authenticated.Post("/analyze-submission", firestoreHandler.AnalyseSubmissionHandler(config.GeminiConfig))
	authenticated.Get("/overall-analysis", handlers.OverallAnalysisHandler(config.GeminiConfig))

	// revision data CRUD routes
	authenticated.Post("/revisions", firestoreHandler.HandleAddRevisions)
	authenticated.Get("/revisions", firestoreHandler.HandleGetRevisions)
	authenticated.Delete("/revisions", firestoreHandler.HandleDeleteRevision)
	authenticated.Put("/revisions", firestoreHandler.HandleUpdateRevision)
	authenticated.Get("/revisions/due", firestoreHandler.HandleGetDueRevisions)

	// mount authenticated
	r.Mount("/api", authenticated)
	log.Println("Server started on port:", config.ServerConfig.Port)

	if err := http.ListenAndServe(fmt.Sprintf(":%s", config.ServerConfig.Port), r); err != nil {
		log.Fatal("Error starting server:", err)
	}
}
