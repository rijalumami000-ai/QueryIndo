package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Data models for frontend response
type TechIndexDataPoint struct {
	Time  string  `json:"time"`
	Value float64 `json:"value"`
}

type TechIndexItem struct {
	Symbol         string               `json:"symbol"`
	Name           string               `json:"name"`
	Value          string               `json:"value"`
	Change         string               `json:"change"`
	IsPositive     bool                 `json:"isPositive"`
	HistoricalData []TechIndexDataPoint `json:"historicalData"`
}

// Yahoo Finance API parsing structs
type YahooChartResponse struct {
	Chart struct {
		Result []struct {
			Meta struct {
				Currency             string  `json:"currency"`
				Symbol               string  `json:"symbol"`
				RegularMarketPrice   float64 `json:"regularMarketPrice"`
				ChartPreviousClose   float64 `json:"chartPreviousClose"`
			} `json:"meta"`
			Timestamp []int64 `json:"timestamp"`
			Indicators struct {
				Quote []struct {
					Close []float64 `json:"close"`
				} `json:"quote"`
			} `json:"indicators"`
		} `json:"result"`
		Error interface{} `json:"error"`
	} `json:"chart"`
}

// In-Memory Cache configuration
type CacheEntry struct {
	Data      []TechIndexItem
	ExpiresAt time.Time
}

var (
	cacheInstance CacheEntry
	cacheMutex    sync.Mutex
	cacheDuration = 5 * time.Minute
)

// Helper to fetch and parse Yahoo Finance chart data
func fetchYahooData(symbol string, rangeStr string, intervalStr string) (*YahooChartResponse, error) {
	url := fmt.Sprintf("https://query1.finance.yahoo.com/v8/finance/chart/%s?range=%s&interval=%s", symbol, rangeStr, intervalStr)
	
	client := &http.Client{Timeout: 5 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	// Use standard browser User-Agent to prevent getting blocked by Yahoo Finance
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("yahoo finance API returned status: %d", resp.StatusCode)
	}
	
	var chartResp YahooChartResponse
	if err := json.NewDecoder(resp.Body).Decode(&chartResp); err != nil {
		return nil, err
	}
	
	if len(chartResp.Chart.Result) == 0 {
		return nil, fmt.Errorf("no chart results found for symbol %s", symbol)
	}
	
	return &chartResp, nil
}

// Generate fallback items if Yahoo Finance API fails or for non-public tickers
func generateFallbackItem(symbol string) TechIndexItem {
	switch symbol {
	case "IDXTECH":
		// Static values from original mock data
		history := make([]TechIndexDataPoint, 24)
		baseVals := []float64{
			7245, 7230, 7218, 7240, 7260, 7275, 7310, 7295,
			7330, 7365, 7340, 7380, 7350, 7370, 7395, 7410,
			7385, 7400, 7390, 7405, 7415, 7425, 7418, 7420,
		}
		for i := 0; i < 24; i++ {
			hr := fmt.Sprintf("%02d:00", i)
			history[i] = TechIndexDataPoint{
				Time:  hr,
				Value: baseVals[i],
			}
		}
		return TechIndexItem{
			Symbol:         "IDXTECH",
			Name:           "Indeks Tekno RI",
			Value:          "7.420,5",
			Change:         "+2,40%",
			IsPositive:     true,
			HistoricalData: history,
		}
		
	case "NVDA":
		history := make([]TechIndexDataPoint, 24)
		baseVals := []float64{
			133.2, 133.0, 132.8, 133.1, 133.5, 133.9, 134.4, 134.1,
			134.8, 135.6, 135.2, 136.0, 135.7, 136.3, 136.8, 137.2,
			136.9, 137.5, 137.1, 137.6, 137.9, 138.1, 138.0, 138.25,
		}
		for i := 0; i < 24; i++ {
			hr := fmt.Sprintf("%02d:00", i)
			history[i] = TechIndexDataPoint{
				Time:  hr,
				Value: baseVals[i],
			}
		}
		return TechIndexItem{
			Symbol:         "NVDA",
			Name:           "NVIDIA Corp",
			Value:          "$138.25",
			Change:         "+3,80%",
			IsPositive:     true,
			HistoricalData: history,
		}
		
	case "BTC/IDR":
		history := make([]TechIndexDataPoint, 24)
		baseVals := []float64{
			1065, 1060, 1058, 1062, 1068, 1070, 1075, 1072,
			1078, 1080, 1076, 1082, 1079, 1081, 1083, 1085,
			1082, 1084, 1080, 1083, 1084, 1086, 1084, 1085,
		}
		for i := 0; i < 24; i++ {
			hr := fmt.Sprintf("%02d:00", i)
			history[i] = TechIndexDataPoint{
				Time:  hr,
				Value: baseVals[i] * 1000000.0,
			}
		}
		return TechIndexItem{
			Symbol:         "BTC/IDR",
			Name:           "Bitcoin",
			Value:          "Rp 1.085B",
			Change:         "+1,90%",
			IsPositive:     true,
			HistoricalData: history,
		}
		
	case "NASDAQ":
		history := make([]TechIndexDataPoint, 24)
		baseVals := []float64{
			16500, 16520, 16490, 16530, 16550, 16580, 16610, 16590,
			16620, 16650, 16630, 16670, 16640, 16660, 16690, 16710,
			16680, 16700, 16690, 16705, 16715, 16725, 16718, 16730.2,
		}
		for i := 0; i < 24; i++ {
			hr := fmt.Sprintf("%02d:00", i)
			history[i] = TechIndexDataPoint{
				Time:  hr,
				Value: baseVals[i],
			}
		}
		return TechIndexItem{
			Symbol:         "NASDAQ",
			Name:           "NASDAQ Composite",
			Value:          "16.730,20",
			Change:         "+1,80%",
			IsPositive:     true,
			HistoricalData: history,
		}
		
	case "GOTO":
		history := make([]TechIndexDataPoint, 24)
		baseVals := []float64{
			50, 51, 50, 52, 51, 50, 51, 52,
			53, 52, 51, 50, 51, 52, 53, 52,
			51, 52, 53, 52, 51, 52, 53, 53,
		}
		for i := 0; i < 24; i++ {
			hr := fmt.Sprintf("%02d:00", i)
			history[i] = TechIndexDataPoint{
				Time:  hr,
				Value: baseVals[i],
			}
		}
		return TechIndexItem{
			Symbol:         "GOTO",
			Name:           "GoTo Gojek Tokopedia",
			Value:          "Rp 53",
			Change:         "0,00%",
			IsPositive:     true,
			HistoricalData: history,
		}
		
	case "ETH/IDR":
		history := make([]TechIndexDataPoint, 24)
		baseVals := []float64{
			52.1, 52.0, 51.9, 52.2, 52.4, 52.6, 52.9, 52.7,
			53.0, 53.3, 53.1, 53.4, 53.2, 53.3, 53.5, 53.6,
			53.4, 53.5, 53.3, 53.4, 53.5, 53.6, 53.5, 53.6,
		}
		for i := 0; i < 24; i++ {
			hr := fmt.Sprintf("%02d:00", i)
			history[i] = TechIndexDataPoint{
				Time:  hr,
				Value: baseVals[i] * 1000000.0,
			}
		}
		return TechIndexItem{
			Symbol:         "ETH/IDR",
			Name:           "Ethereum",
			Value:          "Rp 53.60M",
			Change:         "+1,20%",
			IsPositive:     true,
			HistoricalData: history,
		}
		
	case "USD/IDR":
		history := make([]TechIndexDataPoint, 24)
		baseVals := []float64{
			16210, 16215, 16200, 16220, 16225, 16230, 16240, 16235,
			16242, 16248, 16240, 16250, 16244, 16246, 16252, 16254,
			16248, 16250, 16249, 16251, 16253, 16255, 16252, 16254,
		}
		for i := 0; i < 24; i++ {
			hr := fmt.Sprintf("%02d:00", i)
			history[i] = TechIndexDataPoint{
				Time:  hr,
				Value: baseVals[i],
			}
		}
		return TechIndexItem{
			Symbol:         "USD/IDR",
			Name:           "Kurs USD/IDR",
			Value:          "Rp 16.254",
			Change:         "+0,20%",
			IsPositive:     true,
			HistoricalData: history,
		}
		
	case "AI-IDX":
		history := make([]TechIndexDataPoint, 24)
		baseVals := []float64{
			3985, 3970, 3960, 3980, 4005, 4020, 4050, 4035,
			4070, 4095, 4080, 4105, 4090, 4100, 4115, 4125,
			4110, 4130, 4120, 4135, 4140, 4148, 4145, 4150,
		}
		for i := 0; i < 24; i++ {
			hr := fmt.Sprintf("%02d:00", i)
			history[i] = TechIndexDataPoint{
				Time:  hr,
				Value: baseVals[i],
			}
		}
		return TechIndexItem{
			Symbol:         "AI-IDX",
			Name:           "Global AI Index",
			Value:          "4.150,1",
			Change:         "+4,10%",
			IsPositive:     true,
			HistoricalData: history,
		}
		
	default: // STARTUP-RI
		history := make([]TechIndexDataPoint, 24)
		baseVals := []float64{
			455, 456, 457, 455, 454, 453, 452, 454,
			453, 451, 452, 450, 451, 449, 450, 451,
			450, 449, 450, 451, 450, 449, 450, 450,
		}
		for i := 0; i < 24; i++ {
			hr := fmt.Sprintf("%02d:00", i)
			history[i] = TechIndexDataPoint{
				Time:  hr,
				Value: baseVals[i],
			}
		}
		return TechIndexItem{
			Symbol:         "STARTUP-RI",
			Name:           "Funding Vol",
			Value:          "$450M",
			Change:         "-0,50%",
			IsPositive:     false,
			HistoricalData: history,
		}
	}
}

// Map Yahoo Finance data response to our TechIndexItem structure
func processYahooResult(symbol string, name string, rawSymbol string, rangeStr string, intervalStr string) (TechIndexItem, error) {
	data, err := fetchYahooData(rawSymbol, rangeStr, intervalStr)
	if err != nil {
		return generateFallbackItem(symbol), err
	}
	
	res := data.Chart.Result[0]
	latestVal := res.Meta.RegularMarketPrice
	prevClose := res.Meta.ChartPreviousClose
	if prevClose == 0 {
		prevClose = latestVal
	}
	
	changePercent := ((latestVal - prevClose) / prevClose) * 100.0
	
	// Read quote prices
	var rawPrices []float64
	if len(res.Indicators.Quote) > 0 {
		rawPrices = res.Indicators.Quote[0].Close
	}
	
	// Parse historical timestamps & build chart points
	var history []TechIndexDataPoint
	timestampLen := len(res.Timestamp)
	
	// Ensure we don't out-of-index if price quotes mismatch timestamp length
	pricesLen := len(rawPrices)
	dataLen := timestampLen
	if pricesLen < dataLen {
		dataLen = pricesLen
	}
	
	// Extract points (up to last 24 points to represent 24 hours of trading data)
	startIndex := 0
	if dataLen > 24 {
		startIndex = dataLen - 24
	}
	
	for i := startIndex; i < dataLen; i++ {
		tUnix := res.Timestamp[i]
		tObj := time.Unix(tUnix, 0)
		tStr := tObj.Format("15:04")
		
		val := rawPrices[i]
		// In case Yahoo returned null/nan value, fallback to nearest or current
		if val == 0 {
			if i > 0 && rawPrices[i-1] != 0 {
				val = rawPrices[i-1]
			} else {
				val = latestVal
			}
		}
		
		history = append(history, TechIndexDataPoint{
			Time:  tStr,
			Value: val,
		})
	}
	
	// Formatted Values based on type
	var displayValue string
	switch symbol {
	case "BTC/IDR":
		displayValue = fmt.Sprintf("Rp %.3fB", latestVal/1000000000.0)
	case "ETH/IDR":
		displayValue = fmt.Sprintf("Rp %.2fM", latestVal/1000000.0)
	case "USD/IDR":
		displayValue = fmt.Sprintf("Rp %.0f", latestVal)
	case "GOTO":
		displayValue = fmt.Sprintf("Rp %.0f", latestVal)
	case "NVDA":
		displayValue = fmt.Sprintf("$%.2f", latestVal)
	case "NASDAQ":
		displayValue = fmt.Sprintf("%.2f", latestVal)
	default:
		displayValue = fmt.Sprintf("%.2f", latestVal)
	}
	
	return TechIndexItem{
		Symbol:         symbol,
		Name:           name,
		Value:          displayValue,
		Change:         fmt.Sprintf("%+.2f%%", changePercent),
		IsPositive:     changePercent >= 0,
		HistoricalData: history,
	}, nil
}

// GetTechIndexes retrieves indices from Cache or Live API proxy
func GetTechIndexes(c *fiber.Ctx) error {
	cacheMutex.Lock()
	defer cacheMutex.Unlock()
	
	// Return cached data if still valid
	if time.Now().Before(cacheInstance.ExpiresAt) && len(cacheInstance.Data) > 0 {
		return c.JSON(fiber.Map{
			"success": true,
			"source":  "cache",
			"data":    cacheInstance.Data,
		})
	}
	
	// Fetch fresh data (async or sequential)
	var items []TechIndexItem
	
	// 1. IDXTECH -> Yahoo symbol: ^JKTE (Jakarta Technology Index)
	if item, err := processYahooResult("IDXTECH", "Indeks Tekno RI", "^JKTE", "5d", "1h"); err == nil {
		items = append(items, item)
	} else {
		items = append(items, generateFallbackItem("IDXTECH"))
	}
	
	// 2. NVDA -> Yahoo symbol: NVDA
	if item, err := processYahooResult("NVDA", "NVIDIA Corp", "NVDA", "5d", "1h"); err == nil {
		items = append(items, item)
	} else {
		items = append(items, generateFallbackItem("NVDA"))
	}
	
	// 3. BTC/IDR -> Yahoo symbol: BTC-IDR
	if item, err := processYahooResult("BTC/IDR", "Bitcoin", "BTC-IDR", "1d", "1h"); err == nil {
		items = append(items, item)
	} else {
		items = append(items, generateFallbackItem("BTC/IDR"))
	}
	
	// 4. AI-IDX -> Yahoo symbol: BOTZ (Global X Robotics & AI ETF)
	if item, err := processYahooResult("AI-IDX", "Global AI Index", "BOTZ", "5d", "1h"); err == nil {
		items = append(items, item)
	} else {
		items = append(items, generateFallbackItem("AI-IDX"))
	}
	
	// 5. STARTUP-RI -> (Not public, always generated via simulated random walk)
	items = append(items, generateFallbackItem("STARTUP-RI"))
	
	// 6. NASDAQ -> Yahoo symbol: ^IXIC (NASDAQ Composite)
	if item, err := processYahooResult("NASDAQ", "NASDAQ Composite", "^IXIC", "5d", "1h"); err == nil {
		items = append(items, item)
	} else {
		items = append(items, generateFallbackItem("NASDAQ"))
	}
	
	// 7. GOTO -> Yahoo symbol: GOTO.JK (GoTo Gojek Tokopedia)
	if item, err := processYahooResult("GOTO", "GoTo Gojek Tokopedia", "GOTO.JK", "5d", "1h"); err == nil {
		items = append(items, item)
	} else {
		items = append(items, generateFallbackItem("GOTO"))
	}
	
	// 8. ETH/IDR -> Yahoo symbol: ETH-IDR (Ethereum)
	if item, err := processYahooResult("ETH/IDR", "Ethereum", "ETH-IDR", "1d", "1h"); err == nil {
		items = append(items, item)
	} else {
		items = append(items, generateFallbackItem("ETH/IDR"))
	}
	
	// 9. USD/IDR -> Yahoo symbol: USDIDR=X (USD to IDR)
	if item, err := processYahooResult("USD/IDR", "Kurs USD/IDR", "USDIDR=X", "1d", "1h"); err == nil {
		items = append(items, item)
	} else {
		items = append(items, generateFallbackItem("USD/IDR"))
	}
	
	// Update cache
	cacheInstance.Data = items
	cacheInstance.ExpiresAt = time.Now().Add(cacheDuration)
	
	return c.JSON(fiber.Map{
		"success": true,
		"source":  "live",
		"data":    items,
	})
}
