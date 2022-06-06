import React from "react";
import {Box, VStack, Text} from "@chakra-ui/react";



function splitSize(value){
  let num, unit;
  unit = value.replace((num = parseFloat(value)).toString(), '');
  return [num, unit];
}



const ScheduleRange = ({wmax, hmax, hori, horf, rangeStep}) => {
  const asNum = (HHMM) => (60*(HHMM[0]-hori[0])+HHMM[1]-hori[1]);
  const asHHMM = (n) => ([Math.floor(n/60)+hori[0], n%60+hori[1]]);
  const asfmt = (HHMM) => (HHMM[1] < 10? HHMM[0].toString()+':0'+HHMM[1].toString() : HHMM[0].toString()+':'+HHMM[1].toString());

  let hUnit, wUnit;
  [hmax, hUnit] = splitSize(hmax);
  [wmax, wUnit] = splitSize(wmax);
  
  let step = rangeStep;
  let num = Math.round(asNum(horf) / step) + 1
  let ystep = hmax / (num-1);
  let range = [];
  
  for(let i = 0; i < num; i++){
    range.push([asfmt(asHHMM(Math.round(i*step))), i*ystep-(hUnit=='px'? 9 : 1.5)]);
  }
  
  return(
    <VStack>
      <Box className="scheduleFRSeparator" align='center' width='1vw' fontSize='3vh' />
      <Box position='relative' width={wmax.toString()+wUnit} height={hmax.toString()+hUnit}>
        {range.map(([str, y]) => (
          <Text className='text2' position='absolute' right='0vw' top={y.toString()+hUnit}> {str} </Text>
        ))}
      </Box>
    </VStack>
  )
}

export default ScheduleRange;