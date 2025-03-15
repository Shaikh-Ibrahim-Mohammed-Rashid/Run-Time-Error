import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAI
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores.chroma import Chroma
from langchain.chains import RetrievalQA
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Load environment variables
load_dotenv()

# Configure Google API key
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

class DocumentManager:
    def __init__(self, persist_directory="./chroma_db"):
        self.persist_directory = persist_directory
        self.embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        self.vectorstore = None
        self._initialize_vectorstore()

    def _initialize_vectorstore(self):
        """Initialize or load existing vector store"""
        if os.path.exists(self.persist_directory):
            self.vectorstore = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings
            )
        else:
            self.vectorstore = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings
            )

    def add_document(self, pdf_path):
        """Add a new PDF document to the vector store"""
        # Load and split the document
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()
        
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        splits = text_splitter.split_documents(documents)
        
        # Add documents to vector store
        self.vectorstore.add_documents(splits)
        print(f"Added document: {pdf_path}")

    def create_qa_chain(self):
        """Create QA chain using the vector store"""
        llm = GoogleGenerativeAI(
            model="gemini-pro",
            temperature=0.1
        )
        
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=self.vectorstore.as_retriever(search_kwargs={"k": 2})
        )
        
        return qa_chain

def main():
    # Initialize document manager
    doc_manager = DocumentManager()
    
    # Add documents
    # pdf_files = ["sample.pdf"]  # Add your PDF files here
    # for pdf_path in pdf_files:
    #     doc_manager.add_document(pdf_path)
    
    # Create QA chain
    qa_chain = doc_manager.create_qa_chain()
    
    # Example query
    query = "what is the document about?"
    # doc_manager.add_document("sample1.pdf")
    response = qa_chain.invoke({"query": query})
    print(f"Query: {query}\nResponse: {response['result']}")

if __name__ == "__main__":
    main()
