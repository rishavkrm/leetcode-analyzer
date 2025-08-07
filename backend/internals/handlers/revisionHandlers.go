package handlers

import (
	"context"
	"dsa-helper-backend/internals/datastore"
	"dsa-helper-backend/internals/middlewares"
	"dsa-helper-backend/internals/models"
	"encoding/json"
	"fmt"
	"net/http"
)

type Firestore struct {
	Datastore *datastore.Datastore
}

func NewFirestoreHandler(datastore *datastore.Datastore) *Firestore {
	return &Firestore{
		Datastore: datastore,
	}
}

func (fs *Firestore) HandleAddRevisions(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middlewares.UserIDContext).(string)
	if !ok || userId == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	if userId == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var revisionProblems []models.RevisionProblem
	if err := json.NewDecoder(r.Body).Decode(&revisionProblems); err != nil {
		http.Error(w, fmt.Sprintf("Failed to decode request body: %v", err), http.StatusBadRequest)
		return
	}
	if len(revisionProblems) == 0 {
		http.Error(w, "No new problems provided", http.StatusBadRequest)
		return
	}
	err := fs.Datastore.AddRevisionProblems(context.Background(), userId, revisionProblems)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to add revision problems: %v", err), http.StatusInternalServerError)
		return
	}
	err = json.NewEncoder(w).Encode(models.Response{
		Status:  "success",
		Message: "Revision problems added successfully",
		Data:    nil,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode response: %v", err), http.StatusInternalServerError)
		return
	}
}

func (fs *Firestore) HandleGetRevisions(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middlewares.UserIDContext).(string)
	if !ok || userId == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	if userId == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	revisionProblems, err := fs.Datastore.GetRevisionProblems(context.Background(), userId)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to add revision problems: %v", err), http.StatusInternalServerError)
		return
	}
	err = json.NewEncoder(w).Encode(models.Response{
		Status:  "success",
		Message: "Revision problems fetched successfully",
		Data:    revisionProblems,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode response: %v", err), http.StatusInternalServerError)
		return
	}
}

func (fs *Firestore) HandleDeleteRevision(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middlewares.UserIDContext).(string)
	if !ok || userId == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	if userId == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var revisionProblem models.RevisionProblem
	if err := json.NewDecoder(r.Body).Decode(&revisionProblem); err != nil {
		http.Error(w, fmt.Sprintf("Failed to decode request body: %v", err), http.StatusBadRequest)
		return
	}
	err := fs.Datastore.DeleteRevisionProblem(context.Background(), userId, revisionProblem)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to delete revision problem: %v", err), http.StatusInternalServerError)
		return
	}
	err = json.NewEncoder(w).Encode(models.Response{
		Status:  "success",
		Message: "Revision problem deleted successfully",
		Data:    nil,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode response: %v", err), http.StatusInternalServerError)
		return
	}
}

func (fs *Firestore) HandleUpdateRevision(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middlewares.UserIDContext).(string)
	if !ok || userId == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	if userId == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var revisionProblem models.RevisionProblem
	if err := json.NewDecoder(r.Body).Decode(&revisionProblem); err != nil {
		http.Error(w, fmt.Sprintf("Failed to decode request body: %v", err), http.StatusBadRequest)
		return
	}
	err := fs.Datastore.UpdateRevisionProblem(context.Background(), userId, revisionProblem)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to update revision problem: %v", err), http.StatusInternalServerError)
		return
	}
	err = json.NewEncoder(w).Encode(models.Response{
		Status:  "success",
		Message: "Revision problem updated successfully",
		Data:    nil,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode response: %v", err), http.StatusInternalServerError)
		return
	}
}

func (fs *Firestore) HandleGetDueRevisions(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value(middlewares.UserIDContext).(string)
	if !ok || userId == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	if userId == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	dueProblems, err := fs.Datastore.GetDueRevisionProblems(context.Background(), userId)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get due revision problems: %v", err), http.StatusInternalServerError)
		return
	}

	err = json.NewEncoder(w).Encode(models.Response{
		Status:  "success",
		Message: "Due revision problems fetched successfully",
		Data:    dueProblems,
	})
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to encode response: %v", err), http.StatusInternalServerError)
		return
	}
}
