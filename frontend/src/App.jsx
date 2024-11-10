import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Start from './components/Starting_page';
import Login from './components/LoginPage';
import Voting from './components/Voting_main';
// import axios from 'axios';
// import { useEffect, useState } from 'react';



function App() {
  // const [data,setData]=useState([]);

  // const SaveData=async()=>{
  //   try{
      
  //   }

  // }

  // useEffect(()=>{
    
  // },[])
  

  return (
   <>
   <Router>
    <Routes>
      <Route path="/" element={<Start/>}></Route>
      <Route path ="/login" element={<Login/>}></Route>
      <Route path="/voting" element={<Voting/>}></Route>
      </Routes>
    </Router>
    </>
  )
}

export default App
