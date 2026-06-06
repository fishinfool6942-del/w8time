# Device Integration Guide

## Overview
Restaurant devices transmit wait time data every 60 seconds to the W8TIME cloud server. This guide is for firmware engineers implementing device code.

## Device Requirements
- Network connectivity (WiFi or cellular)
- Real-time clock (for accurate timestamps)
- Wait time input (manual entry, sensor, or POS integration)
- Unique device identifier (MAC address, serial number, or assigned ID)

## API Endpoint
**URL:** `https://api.w8time.app/device-data`  
**Method:** `POST`  
**Content-Type:** `application/json`  
**Interval:** Every 60 seconds during business hours  

## Payload Structure
```json
{
  "id": "REST_001",
  "wait": 12,
  "ts": 1717651400
}
```

### Field Definitions
- **id** (string, 9 bytes max): Unique identifier for this restaurant/device
  - Examples: "REST_001", "DEV_12345", or MAC address
  - Assigned during device setup by W8TIME staff
- **wait** (integer, 0-255): Current wait time in minutes
  - 0 = No wait / Seats available
  - 1-99 = Minutes of wait
  - 255 = Closed or N/A
- **ts** (integer): Unix timestamp (seconds since Jan 1, 1970 UTC)
  - Device should get accurate time from NTP server or system clock
  - Example: 1717651400 = June 6, 2025, 8:30 AM UTC

## Example Implementation (Arduino/ESP32)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>

const char* ssid = "RESTAURANT_WIFI";
const char* password = "PASSWORD";
const char* deviceId = "REST_001";  // Assigned by W8TIME
const char* serverUrl = "https://api.w8time.app/device-data";

int currentWaitTime = 0;  // Update this from your input source

void setup() {
  Serial.begin(115200);
  connectToWiFi();
  configureTime(0, 0, "pool.ntp.org");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    sendWaitTimeUpdate();
  }
  delay(60000);  // Wait 60 seconds before next update
}

void connectToWiFi() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void sendWaitTimeUpdate() {
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");

  // Build JSON payload
  time_t now = time(nullptr);
  String payload = "";
  payload += "{\"id\":\"" + String(deviceId) + "\"";
  payload += ",\"wait\":" + String(currentWaitTime);
  payload += ",\"ts\":" + String(now);
  payload += "}";

  int httpCode = http.POST(payload);
  
  if (httpCode == 200) {
    Serial.println("Wait time sent successfully");
  } else {
    Serial.printf("Error: %d\n", httpCode);
  }
  
  http.end();
}
```

## Error Handling

### Network Issues
- Implement exponential backoff (retry after 5s, 10s, 30s, 60s)
- Log failed attempts locally
- Resume normal schedule when connection restored

### Invalid Payload
- Server returns 400 with error message
- Check: device ID format, wait time range (0-255), timestamp validity

### Server Errors (5xx)
- Retry up to 3 times with exponential backoff
- Continue normal schedule regardless

## Testing

### Manual Test
```bash
curl -X POST https://api.w8time.app/device-data \
  -H "Content-Type: application/json" \
  -d '{"id":"TEST_001","wait":15,"ts":'$(date +%s)'}'
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Wait time recorded",
  "restaurantId": "REST_001",
  "wait": 15,
  "timestamp": 1717651400
}
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | Missing/invalid field | Verify JSON structure and field types |
| 401 Unauthorized | Invalid device ID | Check ID matches assignment from W8TIME |
| 500 Server Error | Database issue | Retry after 60 seconds |
| No response | Network timeout | Check WiFi connection, firewall rules |
| Data not appearing in app | Device sending correctly, but app issue | Check timestamp is recent (not >2 min old) |
