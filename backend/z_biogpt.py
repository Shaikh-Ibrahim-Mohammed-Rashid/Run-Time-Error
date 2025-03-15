from transformers import AutoTokenizer, BioGptModel, pipeline
import torch



def generate_text(prompt, max_length=50):
    """
    Generate text using the BioGPT model.
    
    Args:
        prompt (str): The input text prompt.
        max_length (int): The maximum length of the generated text.
        
    Returns:
        str: The generated text.
    """
    tokenizer = AutoTokenizer.from_pretrained("microsoft/biogpt")
    model = BioGptModel.from_pretrained("microsoft/biogpt")

    inputs = tokenizer("Hello, my dog is cute", return_tensors="pt")
    outputs = model(**inputs)

    last_hidden_states = outputs.last_hidden_state

    # Create a pipeline for text generation
    bio_gpt_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)

    generated = bio_gpt_pipeline(prompt, max_length=max_length, num_return_sequences=1)
    return generated[0]['generated_text']

# Example usage
# if __name__ == "__main__":
#     prompt = "The future of AI in healthcare"
#     generated_text = generate_text(prompt)
#     print(generated_text)