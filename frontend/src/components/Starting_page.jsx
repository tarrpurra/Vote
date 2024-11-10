import { useNavigate } from "react-router-dom";
export default function Start(){

    const navigate =useNavigate();
    const reDirect=()=>{
        let path='/login';
        navigate(path);
    }


    return(
        <div className="h-full flex flex-col justify-center content-center" >
      <div className="h-full w-full flex flex-col justify-center content-center  ">

        <button onClick={reDirect} className="box-border  border-[#06038D] border-2 flex-col w-1/2 h-1/3 place-self-center hover:bg-Charkra bg-center bg-contain bg-no-repeat hover:border-transparent   hover:text-transparent hover:animate-spin-slow">
          Login
        </button>
      
      </div>
    </div>
    
    )

}