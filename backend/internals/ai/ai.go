package ai

import (
	"dsa-helper-backend/internals/config"
	"dsa-helper-backend/internals/models"
	"dsa-helper-backend/internals/utils"
)
import (
	"context"
	"encoding/json"
	"fmt"
	"google.golang.org/genai"
	"log"
)

type ToCheck struct {
	ProblemId        int64  `json:"problem_id"`
	ProblemStatement string `json:"problem_statement"`
	CandidateCode    string `json:"candidate_code"`
}

func GenerateSystemInstructionPrompt(caseType string) string {
	switch caseType {
	case "SubmissionFeedback":
		return `You are an **expert software engineer** and a **highly experienced technical interviewer**.
				Your task is to perform a rigorous and detailed code review of a candidate's solution for a given problem statement.
				Provide **comprehensive feedback** covering correctness, logical flaws, handling of edge cases, and propose specific fixes.
				Analyze the **time and space complexity** (Big O notation) of the provided code, justify your analysis, and suggest potential optimizations.
				Evaluate the code's style, adherence to naming conventions, readability, use of comments, and best practices.
				Additionally, outline high-level **alternative algorithmic approaches or data structures** that could solve the problem, discussing their trade-offs without providing code examples unless explicitly requested.
				Finally, summarize whether the candidate's solution is considered **optimal for interview settings**, along with its current and the best possible time and space complexities.
				Your output must strictly adhere to the provided JSON schema.`

	case "HighLevelAnalysis":
		return `You are a **highly efficient and concise code evaluator** specialized in assessing algorithmic solutions for technical interviews.
				Your primary task is to process a **batch of independent coding submissions**. For each 'Problem Statement' and its 'Candidate Code' provided in the batch, you must perform the following:
				1. Determine if the candidate's solution is the **best possible** in terms of algorithmic efficiency for an interview scenario.
				2. Identify and state the **current time complexity** (Big O notation) of the candidate's code.
				3. Identify and state the **current space complexity** (Big O notation) of the candidate's code.
				4. Identify and state the **best possible time complexity** (Big O notation) achievable for the problem.
				5. Identify and state the **best possible space complexity** (Big O notation) achievable for the problem.

				All complexities should be single-word Big O notations (e.g., O(N), O(logN), O(1), O(N^2), O(N log N)).

				Your entire response must be a **single JSON array**. Each element in this array must be a JSON object containing the 'isBestSolution', 'bestTimeComplexity', 'currentTimeComplexity', 'bestSpaceComplexity', and 'currentSpaceComplexity' for one individual submission from the batch. 
				Ensure the order of results in the JSON array corresponds to the order of submissions in the input. 
				Adhere strictly to the provided JSON array schema.`

	case "AnalyseSubmission":
		return `You are an **expert coding mentor** and **refactoring assistant**.
				Your task is to analyze a candidate's code for a given problem, provide an **optimal solution**, generate a **diff view** between the candidate's code and the optimal solution, and offer **detailed insights for improvement**.
				The insights should cover algorithmic aspects, complexity optimizations, and common coding patterns.
				Additionally, provide a structured list of **actionable steps** with titles, descriptions, and corresponding code snippets to guide the candidate in improving their solution towards the optimal one.
				Ensure the optimal code and diff view are accurate and complete.
				Your output must strictly adhere to the provided JSON schema.`

	case "GivePatternInfo":
		return `You are an **authoritative encyclopedia** on algorithmic patterns and data structures, fluent in various programming languages.
				Your task is to provide **comprehensive and structured information** about a specified coding pattern in the context of a given programming language.
				Detail the pattern's name, a thorough description, its category (e.g., Two Pointers, Dynamic Programming, BFS, DFS), and its priority for interview preparation (e.g., 'High', 'Medium', 'Low').
				Explain **why this pattern is important** or has the given priority.
				List **key conceptual points** that define or are crucial to understanding the pattern.
				Provide a curated list of relevant LeetCode-style **questions**, including their ID, title, difficulty, and URL, that exemplify the pattern.
				Highlight **common mistakes** developers make when implementing this pattern.
				Finally, provide a general **code template** for the pattern in the specified language, ensuring it's idiomatic and illustrative.
				Your output must strictly adhere to the provided JSON schema.`
	case "OverallAnalysis":
		return `You are an expert coding tutor and analytical assistant specialized in identifying algorithmic and data structure patterns in code submissions.
				Your task is to analyze a collection of past code submissions from a user. Each submission includes a problem statement and the user's code.
				Based on this collection, perform the following analysis:
				Identify which Data Structure and Algorithm (DSA) patterns (e.g., Two Pointers, Sliding Window,
				Dynamic Programming, BFS, DFS, Stack, Queue, Hash Map, Binary Search, etc.) the user has successfully applied across the submissions.
				Identify which DSA patterns the user struggled with, applied incorrectly, or completely missed in problems where those patterns would have been optimal or highly effective.
				Based on the applied and missed patterns, infer the user's strengths (patterns they seem comfortable with) and weaknesses (patterns they need more practice with).
				Suggest specific DSA patterns, topics, or problem categories that the user should focus on learning or practicing to improve their skills. 
				Prioritize areas identified as weaknesses or commonly missed patterns.
				Optionally, identify any common conceptual mistakes related to specific patterns that appear across multiple submissions.
				Your analysis should be a high-level overview based on the aggregate of submissions, not a detailed review of each individual piece of code. Do NOT provide optimal code solutions, detailed time/space complexity analysis for individual submissions, or line-by-line code feedback. Focus solely on identifying and analyzing the DSA patterns and providing targeted learning recommendations.
				Your output must strictly adhere to the provided JSON schema.`
	default:
		return `You are a **versatile AI assistant** specialized in code analysis and algorithmic problem-solving.
				If a specific task is not defined, you will provide a general but insightful analysis based on the input problem statement and code.
				For more targeted feedback such as detailed code reviews, complexity analysis, optimal solutions, or algorithmic pattern information, please specify your request clearly.`
	}
}

func SubmissionFeedback(config *config.GeminiConfig, input *ToCheck) (feedback models.SubmissionFeedbackResponse, err error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  config.APIKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}
	// Call the GenerateContent method.
	var result *genai.GenerateContentResponse
	result, err = client.Models.GenerateContent(ctx,
		config.FlashBig,
		genai.Text(fmt.Sprintf("Problem Statement: %s\nCandidate Code: %s", input.ProblemStatement, input.CandidateCode)),
		&genai.GenerateContentConfig{
			ResponseMIMEType:  "application/json",
			SystemInstruction: &genai.Content{Parts: []*genai.Part{{Text: GenerateSystemInstructionPrompt("SubmissionFeedback")}}},
			ResponseSchema: &genai.Schema{
				Type: genai.TypeObject,
				Properties: map[string]*genai.Schema{
					"correctnessAndLogic": {
						Type:        genai.TypeString,
						Description: "Detailed feedback on correctness, logical errors, edge cases, and proposed fixes.",
					},
					"timeComplexityAnalysis": {
						Type:        genai.TypeString,
						Description: "Analysis of Big O time complexity, justification, and potential optimizations.",
					},
					"spaceComplexityAnalysis": {
						Type:        genai.TypeString,
						Description: "Analysis of Big O space complexity, justification, and potential optimizations.",
					},
					"codeStyleAndReadability": {
						Type:        genai.TypeString,
						Description: "Feedback on code style, naming conventions, readability, comments, and best practices.",
					},
					"alternativeApproaches": {
						Type:        genai.TypeString,
						Description: "High-level overview of alternative algorithms or data structures, and their trade-offs. Do not provide code examples unless specifically asked.",
					},
					"summary": {
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"bestSolution": {
								Type:        genai.TypeBoolean,
								Description: "Indicates if the provided solution is the best possible solution for the problem in interviews.",
							},
							"bestTimeComplexity": {
								Type:        genai.TypeString,
								Description: "The best possible time complexity for the problem in single word like O(N) etc.",
							},
							"currentTimeComplexity": {
								Type:        genai.TypeString,
								Description: "Current time complexity for the problem in single word like O(N) etc.",
							},
							"bestSpaceComplexity": {
								Type:        genai.TypeString,
								Description: "The best possible space complexity for the problem in single word like O(N) etc.",
							},
							"currentSpaceComplexity": {
								Type:        genai.TypeString,
								Description: "Current space complexity for the problem in single word like O(N) etc.",
							},
						},
					},
				},
				// Define the desired order of properties in the JSON output
				PropertyOrdering: []string{
					"correctnessAndLogic",
					"timeComplexityAnalysis",
					"spaceComplexityAnalysis",
					"codeStyleAndReadability",
					"alternativeApproaches",
					"summary",
				},
			},
		},
	)
	if err != nil {
		return feedback, err
	}
	err = json.Unmarshal([]byte(result.Text()), &feedback)
	return feedback, err
}
func HighLevelAnalysis(submissions []models.LeetCodeSubmission, config config.GeminiConfig) ([]models.LeetCodeSubmission, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  config.APIKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}
	batchSize := config.BatchSize
	submissions_copy := make([]models.LeetCodeSubmission, len(submissions))
	copy(submissions_copy, submissions)
	submissions = utils.FilterAllClearSolution(submissions)
	for i := 0; i < (len(submissions)/batchSize)+1; i++ {
		if i*batchSize >= len(submissions) {
			break
		}
		input := submissions[i*batchSize : min((i+1)*batchSize, len(submissions))]
		inputPrompt := "Analyze the following code submissions:\n\n"
		for i, sub := range input {
			inputPrompt += fmt.Sprintf("--- Submission %d ---\n", i+1)
			inputPrompt += fmt.Sprintf("Problem Statement: %s\n", sub.Title)
			inputPrompt += fmt.Sprintf("Candidate Code:\n%s\n\n", sub.Code)
		}
		inputPrompt += "--- End of Submissions ---\n"
		result, err := client.Models.GenerateContent(ctx,
			config.FlashSmall,
			genai.Text(string(inputPrompt)),
			&genai.GenerateContentConfig{
				ResponseMIMEType:  "application/json",
				SystemInstruction: &genai.Content{Parts: []*genai.Part{{Text: GenerateSystemInstructionPrompt("HighLevelAnalysis")}}},
				ResponseSchema: &genai.Schema{
					Type: genai.TypeArray,
					Items: &genai.Schema{
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"isBestSolution": {
								Type:        genai.TypeBoolean,
								Description: "Indicates if the provided solution is the best possible solution for the problem in interviews.",
							},
							"bestTimeComplexity": {
								Type:        genai.TypeString,
								Description: "The best possible time complexity for the problem in single word like O(N) etc.",
							},
							"currentTimeComplexity": {
								Type:        genai.TypeString,
								Description: "Current time complexity for the problem in single word like O(N) etc.",
							},
							"bestSpaceComplexity": {
								Type:        genai.TypeString,
								Description: "The best possible space complexity for the problem in single word like O(N) etc.",
							},
							"currentSpaceComplexity": {
								Type:        genai.TypeString,
								Description: "Current space complexity for the problem in single word like O(N) etc.",
							},
						},
						Required: []string{"isBestSolution", "bestTimeComplexity", "currentTimeComplexity", "bestSpaceComplexity", "currentSpaceComplexity"},
					},
				},
			},
		)
		if err != nil {
			log.Println("Error generating content:", err)
			return submissions, err
		}
		r := result.Text()
		responses := []models.HighLevelAnalysisResponse{}
		err = json.Unmarshal([]byte(r), &responses)
		for j := 0; j < len(responses); j++ {
			if i*batchSize+j >= len(submissions) {
				break
			}
			submissions[i*batchSize+j].IsBestSolution = responses[j].BestSolution
			submissions[i*batchSize+j].BestTimeComplexity = responses[j].BestTimeComplexity
			submissions[i*batchSize+j].CurrentTimeComplexity = responses[j].CurrentTimeComplexity
			submissions[i*batchSize+j].BestSpaceComplexity = responses[j].BestSpaceComplexity
			submissions[i*batchSize+j].CurrentSpaceComplexity = responses[j].CurrentSpaceComplexity
		}
		if err != nil {
			return submissions, err
		}
	}
	for i := 0; i < len(submissions_copy); i++ {
		// add all non all clear again
		if submissions_copy[i].StatusDisplay != "Accepted" {
			submissions = append(submissions, submissions_copy[i])
		}
	}
	return submissions, err
}
func AnalyseSubmission(toCheck *ToCheck, config config.GeminiConfig) (models.AnalyseSubmissionResponse, error) {
	ctx := context.Background()
	analysedSubmission := models.AnalyseSubmissionResponse{}
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  config.APIKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}
	result, err := client.Models.GenerateContent(ctx,
		config.FlashBig,
		genai.Text(fmt.Sprintf("Problem Statement: %s\nCandidate Code: %s", toCheck.ProblemStatement, toCheck.CandidateCode)),
		&genai.GenerateContentConfig{
			ResponseMIMEType:  "application/json",
			SystemInstruction: &genai.Content{Parts: []*genai.Part{{Text: GenerateSystemInstructionPrompt("AnalyseSubmission")}}},
			ResponseSchema: &genai.Schema{
				Type: genai.TypeObject,
				Properties: map[string]*genai.Schema{
					"optimalCode": {
						Type:        genai.TypeString,
						Description: "The optimal code for the problem."},
					"diffView": {
						Type:        genai.TypeString,
						Description: "The diff view of the optimal code and the candidate code."},
					"insights": {
						Type: genai.TypeObject,
						Properties: map[string]*genai.Schema{
							"algorithmic": {
								Type:        genai.TypeString,
								Description: "Algorithmic insights and suggestions for improvement."},
							"complexity": {
								Type:        genai.TypeString,
								Description: "Complexity analysis and suggestions for improvement."},
							"patterns": {
								Type:        genai.TypeString,
								Description: "Patterns used in the code and suggestions for improvement."},
						},
					},
					"steps": {
						Type: genai.TypeArray,
						Items: &genai.Schema{
							Type: genai.TypeObject,
							Properties: map[string]*genai.Schema{
								"title": {
									Type:        genai.TypeString,
									Description: "Title of the step."},
								"description": {
									Type:        genai.TypeString,
									Description: "Description of the step."},
								"code": {
									Type:        genai.TypeString,
									Description: "Code for the step."},
							},
						},
						Description: "Steps to improve the code.",
					}},
			},
		},
	)
	if err != nil {
		log.Println("Error generating content:", err)
		return analysedSubmission, err
	}
	r := result.Text()
	err = json.Unmarshal([]byte(r), &analysedSubmission)
	if err != nil {
		fmt.Println("Error unmarshalling response:", result.Text())
		return analysedSubmission, err
	}
	return analysedSubmission, nil
}
func GivePatternInfo(pattern string, language string, config config.GeminiConfig) (models.PatternInfo, error) {
	ctx := context.Background()
	patternInfo := models.PatternInfo{}
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  config.APIKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Fatal(err)
	}
	result, err := client.Models.GenerateContent(ctx,
		config.FlashSmall,
		genai.Text(fmt.Sprintf("Pattern: %s\nLanguage: %s", pattern, language)),
		&genai.GenerateContentConfig{
			ResponseMIMEType:  "application/json",
			SystemInstruction: &genai.Content{Parts: []*genai.Part{{Text: GenerateSystemInstructionPrompt("GivePatternInfo")}}},
			ResponseSchema: &genai.Schema{
				Type: genai.TypeObject,
				Properties: map[string]*genai.Schema{
					"name": {
						Type:        genai.TypeString,
						Description: "Name of the pattern."},
					"description": {
						Type:        genai.TypeString,
						Description: "Description of the pattern."},
					"category": {
						Type:        genai.TypeString,
						Description: "Category of the pattern."},
					"priority": {
						Type:        genai.TypeString,
						Description: "Priority of the pattern."},
					"whyPriority": {
						Type:        genai.TypeString,
						Description: "Why this pattern is important."},
					"keyPoints": {
						Type: genai.TypeArray,
						Items: &genai.Schema{
							Type:        genai.TypeString,
							Description: "Key points of the pattern."},
						Description: "Key points of the pattern."},
					"questions": {
						Type: genai.TypeArray,
						Items: &genai.Schema{
							Type: genai.TypeObject,
							Properties: map[string]*genai.Schema{
								"id": {
									Type:        genai.TypeString,
									Description: "ID of the question."},
								"title": {
									Type:        genai.TypeString,
									Description: "Title of the question."},
								"difficulty": {
									Type:        genai.TypeString,
									Description: "Difficulty of the question."},
								"url": {
									Type:        genai.TypeString,
									Description: "URL of the question."},
							},
						}},
					"commonMistakes": {
						Type: genai.TypeArray,
						Items: &genai.Schema{
							Type:        genai.TypeString,
							Description: "Common mistakes.",
						},
						Description: "Common mistakes.",
					},
					"template": {
						Type:        genai.TypeString,
						Description: "Template for the pattern."},
				},
				Required: []string{"name", "description", "category", "priority", "whyPriority", "keyPoints", "questions", "commonMistakes", "template"},
			}})
	if err != nil {
		log.Println("Error generating content:", err)
		return patternInfo, err
	}
	r := result.Text()
	err = json.Unmarshal([]byte(r), &patternInfo)
	if err != nil {
		return patternInfo, err
	}
	return patternInfo, nil
}
func OverallAnalysis(submissions []models.LeetCodeSubmission, config config.GeminiConfig) (models.DSAPatternAnalysisResponse, error) {
	ctx := context.Background()
	analysisResult := models.DSAPatternAnalysisResponse{}
	client, err := genai.NewClient(ctx, &genai.ClientConfig{
		APIKey:  config.APIKey,
		Backend: genai.BackendGeminiAPI,
	})
	if err != nil {
		log.Println(err)
	}
	inputPrompt := "Analyze the following code submissions:\n\n"
	for i, sub := range submissions {
		inputPrompt += fmt.Sprintf("--- Submission %d ---\n", i+1)
		inputPrompt += fmt.Sprintf("Problem Statement: %s\n", sub.Title)
		inputPrompt += fmt.Sprintf("Candidate Code:\n%s\n\n", sub.Code)
	}
	inputPrompt += "--- End of Submissions ---\n"
	systemInstruction := GenerateSystemInstructionPrompt("OverallAnalysis")
	result, err := client.Models.GenerateContent(ctx,
		config.FlashSmall,
		genai.Text(inputPrompt),
		&genai.GenerateContentConfig{
			ResponseMIMEType:  "application/json",
			SystemInstruction: &genai.Content{Parts: []*genai.Part{{Text: systemInstruction}}},
			ResponseSchema: &genai.Schema{
				Type: genai.TypeObject,
				Properties: map[string]*genai.Schema{
					"strengths": {
						Type:        genai.TypeArray,
						Description: "List of DSA patterns the user seems strong in, based on successful application.",
						Items:       &genai.Schema{Type: genai.TypeString},
					},
					"weaknesses": {
						Type:        genai.TypeArray,
						Description: "List of DSA patterns the user seems weak in or frequently missed, based on analysis.",
						Items:       &genai.Schema{Type: genai.TypeString},
					},
					"learningRecommendations": {
						Type:        genai.TypeArray,
						Description: "Suggested DSA patterns, topics, or problem categories for the user to focus on.",
						Items:       &genai.Schema{Type: genai.TypeString},
					},
					"commonMistakesSummary": {
						Type:        genai.TypeString,
						Description: "A summary of common conceptual mistakes related to patterns observed across submissions (optional, provide if applicable).",
					},
				},
				Required: []string{"strengths", "weaknesses", "learningRecommendations", "commonMistakesSummary"},
			},
		},
	)

	if err != nil {
		log.Println("Error generating content for DSA pattern analysis:", err)
		return analysisResult, err
	}

	// Extract and unmarshal the JSON response
	r := result.Text()
	err = json.Unmarshal([]byte(r), &analysisResult)
	if err != nil {
		log.Println("Error unmarshalling DSA pattern analysis response:", err)
		return analysisResult, err
	}

	return analysisResult, nil
}
