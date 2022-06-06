import {VStack, Text, Tooltip} from "@chakra-ui/react";

const Card = ({line1, line2, line3, bg, x, y, h, w, hori, horf}) =>{
    return(
    <Tooltip label={hori[0].toString()+':'+hori[1].toString()+' - '+horf[0].toString()+':'+horf[1].toString()}>
    <VStack bg={bg}
            position='absolute' 
            left={x} 
            top={y} 
            width={w} 
            height={h} 
            borderRadius='15'
            overflow='hidden'
            justifyContent='center'
            boxShadow='lg'
            spacing='0' 
            className='text4'
            >
      {line1 != ''? <Text> {line1} </Text> : <></>}
      {line2 != ''? <Text> {line2} </Text> : <></>}
      {line3 != ''? <Text> {line3} </Text> : <></>}
    </VStack> 
    </Tooltip>
    )
  }

export default Card;