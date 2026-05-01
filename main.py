from bytez import Bytez

# 🔐 Replace this with your NEW API key (revoke old one!)
key = "5fd92b92eaceb3edaffa1c49021ba223"

# Initialize SDK
sdk = Bytez(key)

# Select model
model = sdk.model("anthropic/claude-opus-4-6")

# Send request
results = model.run([
    {
        "role": "user",
        "content": "Hello"
    }
])

# Print result
print({
    "error": results.error,
    "output": results.output
})