package utils

import (
	"dsa-helper-backend/internals/models"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

const leetCodePageSize = 20

func FilterAllClearSolution(submissions []models.LeetCodeSubmission) (filteredSubmissions []models.LeetCodeSubmission) {
	for _, submission := range submissions {
		if submission.StatusDisplay == "Accepted" {
			filteredSubmissions = append(filteredSubmissions, submission)
		}
	}
	return filteredSubmissions
}

func LeetCodeSubmissionsFetch(cookie string, limit int) (submissions []models.LeetCodeSubmission, err error) {
	if limit <= 0 {
		return nil, nil // Or return an error depending on desired behavior for invalid limit
	}

	// Create http.Client once
	client := &http.Client{}

	// Calculate the number of pages needed
	numRequests := (limit + leetCodePageSize - 1) / leetCodePageSize // Ceiling division

	// Pre-allocate capacity for the submissions slice to minimize reallocations
	submissions = make([]models.LeetCodeSubmission, 0, limit)

	for i := 0; i < numRequests; i++ { // Loop based on the number of requests
		offset := i * leetCodePageSize
		currentLimit := leetCodePageSize

		// Adjust the limit for the last page
		if offset+currentLimit > limit {
			currentLimit = limit - offset
		}

		if currentLimit <= 0 {
			break
		}

		url := fmt.Sprintf("https://leetcode.com/api/submissions/?offset=%d&limit=%d", offset, currentLimit)

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			log.Printf("Error creating request for URL %s: %v\n", url, err)
			return nil, fmt.Errorf("error creating request: %w", err) // Wrap the error
		}
		req.Header.Set("Cookie", cookie)

		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Error fetching submissions from URL %s: %v\n", url, err)
			return nil, fmt.Errorf("error fetching submissions: %w", err) // Wrap the error
		}
		defer func(Body io.ReadCloser) {
			Body.Close()
		}(resp.Body)


		submission_dump := models.SubmissionsDump{}
		err = json.NewDecoder(resp.Body).Decode(&submission_dump)
		if err != nil {
			log.Printf("Error decoding JSON from URL %s: %v\n", url, err)
			return nil, fmt.Errorf("error decoding submissions: %w", err) // Wrap the error
		}
		submissions = append(submissions, submission_dump.Submissions...)
		time.Sleep(500000000*1)
	}

	return submissions, nil
}