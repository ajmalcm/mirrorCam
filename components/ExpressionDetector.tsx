import { loadFaceApiModels } from '@/lib/faceApiLoader'
import React,{useEffect} from 'react'

const ExpressionDetector = ({videoRef}:{videoRef: React.RefObject<HTMLVideoElement>}) => {

    useEffect(()=>{
        const detectFaceExpressions = async ()=>{
            try{
                await loadFaceApiModels();
                console.log("Face API models loaded, starting expression detection...");
                // Here you can add the code to start detecting expressions using face-api.js
            }catch(error){
                console.error("Error loading Face API models:", error);
            }
        }

        detectFaceExpressions();
    },[])

  return (
    <div>ExpressionDetector</div>
  )
    
}

export default ExpressionDetector