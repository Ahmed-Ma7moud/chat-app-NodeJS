-- Inputs 
local capacity   = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now        = tonumber(ARGV[3])

-- Load stored bucket data from Redis
local bucket = redis.call("HMGET", KEYS[1], "tokens", "lastRefill")
local tokens = tonumber(bucket[1])
local lastRefill = tonumber(bucket[2])

if tokens == nil then
  tokens = capacity
  lastRefill = now
end

-- Calculate how many tokens to add back
local seconds = (now - lastRefill) / 1000.0
tokens = math.min(capacity, tokens + seconds * refillRate)
lastRefill = now

local allowed = 0
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
else
  tokens = 0
end

-- Save updated bucket back into Redis
redis.call("HMSET", KEYS[1], "tokens", tokens, "lastRefill", lastRefill)

-- Set expiration 
local ttl = math.ceil((capacity / refillRate) * 2)
redis.call("EXPIRE", KEYS[1], ttl)

return allowed
