import { Box, Flex, Heading, Text, Textarea } from "@chakra-ui/react"
import { useState, useRef, useEffect } from "react"
import { Button } from "./components/ui/button"
import {SSE} from "sse.js";

function App() {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState('')

  const resultRef: any = useRef()

  useEffect(()=>{
    //@ts-ignore
    resultRef.current = results
  },[results])



  const handlePromptChange = (e: any)=>{
    let inputValue = e.target.value
    setPrompt(inputValue)
  }

  const handleSubmitPromptBtnClicked = async () => {
    if (prompt !== '') {
      setIsLoading(true);
      setResults('');
      
      // get api url
      const url = 'http://127.0.0.1:8000/ask_stream';
      // payload
      const data = { question: prompt };
  
      const source = new SSE(url, {
        headers: {
          "Content-Type": "application/json",
        },
        method: 'POST',
        payload: JSON.stringify(data),
      });
  
      // Start streaming when source is initialized
      source.stream();
  
      // Handle each message in the stream
      source.addEventListener("message", (e: any) => {
        console.log('Received event:', e);
        if (e.data) {
          const text = e.data;
          if (text !== '\n') {
            resultRef.current = resultRef.current + text;
            setResults(resultRef.current);  // Update the results state
          }
        } else {
          console.log('End of stream detected.');
          source.close();
          setIsLoading(false);  // Stop loading when stream ends
        }
      });
  
      // Add error handling for robustness
      source.addEventListener("error", () => {
        console.error('An error occurred in the stream');
        source.close();
        setIsLoading(false);
      });
    } else {
      alert('Please insert a prompt!!');
    }
  };

  const handleClrPromptBtnClicked = () =>{
    setPrompt('')
    setResults('')
  }
  

  return (
    <Flex 
      width={"100vw"}
      height={"100vh"}
      alignContent={"center"}
      justifyContent={"center"}
      bgGradient="linear(to-b, orange.100, purple.300)"
    > 
     <Box maxW="2xl" m="0 auto" p="20px">
       <Heading
        as='h1'
        textAlign={"center"}
        fontSize={"5xl"}
        mt={"100px"}
        bgGradient={"linear(to-l, #7928CA, #FF0080"} 
       >
        React & OpenAI
       </Heading>
       <Heading as={"h2"} textAlign={"center"} fontSize={"3xl"} mt={"5"}>
        With Server Sent Events (SSE)
       </Heading>
       <Text
       fontSize={"xl"}
       textAlign={"center"}
       mt={"30px"}
       >
       This is a React sample web application making use of API to perform prompt completions. 
       Results are received in Server Sent Events (SSE) in real time.
       </Text>
       <Textarea
       value={prompt}
       onChange={handlePromptChange}
       placeholder="Insert your prompt here ..."
       mt={"30px"}
       size={'lg'}
       />
        <Button
         loading={isLoading}
         loadingText={"Loading ..."}
         colorScheme="teal"
         size="lg"
         mt="30px"
         onClick={handleSubmitPromptBtnClicked}
        >
          Submit Prompt
        </Button>
        <Button
         loadingText={"Loading ..."}
         colorScheme="teal"
         size="lg"
         mt="30px"
         ml={"10px"}
         onClick={handleClrPromptBtnClicked}
        >
          Clear
        </Button>
        {
          results !== '' && (
                  <Box
                   maxW={"2xl"}
                   m="0 auto"
                  >
                     <Heading
                        as={"h5"}
                        textAlign={"left"}
                        fontSize={"lg"}
                        mt={"10px"}
                     >
                      Result: 
                     </Heading>
                     <Text
                       fontSize={"lg"}
                       textAlign={"left"}
                       mt={"20px"}
                     >
                     {results}
                     </Text>
                  </Box>
          )
        }
     </Box>
    </Flex>
  )
}

export default App
