package handlers

import (
	"dsa-helper-backend/internals/ai"
	"dsa-helper-backend/internals/auth"
	"dsa-helper-backend/internals/config"
	"dsa-helper-backend/internals/datastore"
	"dsa-helper-backend/internals/models"
	"dsa-helper-backend/internals/utils"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"firebase.google.com/go/v4/auth"
)

func GoogleSignInHandler(firebaseAuth *auth.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
			return
		}

		var req struct {
			IDToken string `json:"idToken"`
		}

		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, fmt.Sprintf("Invalid request body: %v", err), http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		if req.IDToken == "" {
			http.Error(w, "ID token is required", http.StatusBadRequest)
			return
		}

		// Verify the Google ID token
		token, err := backendAuth.VerifyGoogleIDToken(firebaseAuth, req.IDToken)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to authenticate: %v", err), http.StatusUnauthorized)
			return
		}

		// Return user info
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Authentication successful",
			"user": map[string]interface{}{
				"uid":     token.UID,
				"email":   token.Claims["email"],
				"name":    token.Claims["name"],
				"picture": token.Claims["picture"],
			},
		})
	}
}

func SubmissionFetchHandler(config config.GeminiConfig) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		limit := r.URL.Query().Get("limit")
		limitNum, err := strconv.ParseInt(limit, 10, 10)
		if err != nil {
			limitNum = 20
		}
		limitNumInt := int(limitNum)
		cookie := r.Header.Get("X-LeetCode-Cookie")
		if cookie == "" {
			http.Error(w, "No cookie provided", http.StatusBadRequest)
			return
		}
		submissions, err := utils.LeetCodeSubmissionsFetch(cookie, limitNumInt)
		if err != nil {
			http.Error(w, "Error fetching submissions: "+err.Error(), http.StatusInternalServerError)
			return
		}
		submissions, err = ai.HighLevelAnalysis(submissions, config)
		if err != nil {
			http.Error(w, "Error analysing submissions: "+err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(models.Response{
			Status:  "success",
			Message: fmt.Sprintf("Fetched %d submissions successfully", len(submissions)),
			Data:    submissions,
		})
	}
}

func (fs *Firestore) SubmissionFeedbackHandler(config config.GeminiConfig) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		toCheck := ai.ToCheck{}
		collectionName := "submissionFeedback"
		err := json.NewDecoder(r.Body).Decode(&toCheck)
		if err != nil {
			http.Error(w, "Error parsing input: "+err.Error(), http.StatusBadRequest)

		}
		var dataMap models.SubmissionFeedbackResponse
		retrievedProblem, _ := datastore.GetAnalysisProblems[models.SubmissionFeedbackResponse](r.Context(), fmt.Sprintf("%d", toCheck.ProblemId), fs.Datastore, collectionName)
		if retrievedProblem.CodeStyleAndReadability != "" {
			dataMap = retrievedProblem
		} else {
			dataMap, err = ai.SubmissionFeedback(&config, &toCheck)
			if err != nil {
				http.Error(w, "Error analyzing code: "+err.Error(), http.StatusInternalServerError)
				return
			}
			err = datastore.AddAnalysisProblems(r.Context(), fs.Datastore, dataMap, fmt.Sprintf("%d", toCheck.ProblemId), collectionName)
			if err != nil {
				http.Error(w, "Error saving analyzed code: "+err.Error(), http.StatusInternalServerError)
				return
			}

		}
		json.NewEncoder(w).Encode(models.Response{
			Status:  "success",
			Message: "Feedback completed successfully",
			Data:    dataMap,
		})
	}
}

func (fs *Firestore) AnalyseSubmissionHandler(config config.GeminiConfig) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		toCheck := ai.ToCheck{}
		collectionName := "analyseSubmission"
		err := json.NewDecoder(r.Body).Decode(&toCheck)
		if err != nil {
			http.Error(w, "Error parsing input: "+err.Error(), http.StatusBadRequest)
			return
		}
		var analysis models.AnalyseSubmissionResponse
		retrievedProblem, _ := datastore.GetAnalysisProblems[models.AnalyseSubmissionResponse](r.Context(), fmt.Sprintf("%d", toCheck.ProblemId), fs.Datastore, collectionName)
		if retrievedProblem.OptimalCode != "" {
			analysis = retrievedProblem
		} else {
			analysis, err = ai.AnalyseSubmission(&toCheck, config)
			if err != nil {
				http.Error(w, "Error analyzing submission: "+err.Error(), http.StatusInternalServerError)
				return
			}
			err = datastore.AddAnalysisProblems(r.Context(), fs.Datastore, analysis, fmt.Sprintf("%d", toCheck.ProblemId), collectionName)
			if err != nil {
				http.Error(w, "Error saving analyzed code: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}

		json.NewEncoder(w).Encode(models.Response{
			Status:  "success",
			Message: "Analysis completed successfully",
			Data:    analysis,
		})
	}
}

func PatternInfoHandler(config config.GeminiConfig) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		patternAndlanguage := struct {
			Pattern  string `json:"pattern"`
			Language string `json:"language"`
		}{}
		err := json.NewDecoder(r.Body).Decode(&patternAndlanguage)
		if err != nil {
			http.Error(w, "Error parsing input: "+err.Error(), http.StatusBadRequest)
			return
		}
		patternInfo, err := ai.GivePatternInfo(patternAndlanguage.Pattern, patternAndlanguage.Language, config)
		if err != nil {
			http.Error(w, "Error fetching pattern info: "+err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(models.Response{
			Status:  "success",
			Message: "Fetched pattern info successfully",
			Data:    patternInfo,
		})
	}
}
func OverallAnalysisHandler(config config.GeminiConfig) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		limit := 1
		cookie := r.Header.Get("X-LeetCode-Cookie")
		if cookie == "" {
			http.Error(w, "No cookie provided", http.StatusBadRequest)
			return
		}
		submissions, err := utils.LeetCodeSubmissionsFetch(cookie, limit)
		if err != nil {
			http.Error(w, "Error fetching submissions: "+err.Error(), http.StatusInternalServerError)
			return
		}
		analysis, err := ai.OverallAnalysis(submissions, config)
		if err != nil {
			http.Error(w, "Error analyzing code: "+err.Error(), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(models.Response{
			Status:  "success",
			Message: "Analysis completed successfully",
			Data:    analysis,
		})
	}
}
