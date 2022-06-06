import React from "react";
import {Box, Text} from "@chakra-ui/react";
import {useState, useEffect, useRef} from "react";



const TimeRemaining = ({lastDay}) => {
  const Ref = useRef(null);
  const [timer, setTimer] = useState('0 días 0 horas 0 minutos 0 segundos');
  
  const getTimeRemaining = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);
    const days = Math.floor((total / 1000 / 60 / 60 / 24));
    return {
        total, days, hours, minutes, seconds
    };
  }
  
  const updateTimer = (e) => {
    console.log(window.innerHeight)
    let { total, days, hours, minutes, seconds } = getTimeRemaining(e);
      if (total >= 0) {
        setTimer(
          days + ' días ' + hours + ' horas ' + minutes + ' minutos ' + seconds + ' segundos'
        )
    }
  }
  
  const startTimer = (e) => {
    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      updateTimer(e);
    }, 1000)
    Ref.current = id;
  }
  

  useEffect(() => {
    startTimer(lastDay);
  }, []);
  
  return (
    <Box className="counterBox">
      <Text className="text4" fontSize='2vmax'>Semestre: {timer}</Text> 
    </Box>
  )
}

export default TimeRemaining;