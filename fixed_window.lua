-- if the key does not exist, redis set it to 0 and set the expiration
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])

-- if the key does not exist, it is created with value 0 then increased by 1
local counter = redis.call("INCR", KEYS[1])

-- the counter is created implicitly with value 0 then increased by 1
if tonumber(counter) == 1 then
  redis.call("EXPIRE", KEYS[1], window)
end

if tonumber(counter) > tonumber(limit) then
  return 0
else
  return 1
end