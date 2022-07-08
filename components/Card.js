import {
  VStack, 
  Text, 
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverHeader
} from "@chakra-ui/react";

function hhmm_format(hh, mm){
  let hhmm = (hh < 10? '0'+hh.toString() : hh.toString()) + ':';
  hhmm += (mm < 10? '0'+mm.toString() : mm.toString());
  return hhmm;
}

const Card = ({line1, line2, line3, bg, x, y, h, w, hori, horf}) =>{
  return(
    <Popover>
      <PopoverTrigger>
        <Button bg={bg}
              position='absolute' 
              left={x} 
              top={y} 
              width={w} 
              height={h} 
              borderRadius='15'
              overflow='hidden'
              justifyContent='center'
              boxShadow='lg'
              >
          <VStack className='text4' spacing='3px'>
            {line1 != ''? <Text> {line1} </Text> : <></>}
            {line2 != ''? <Text> {line2} </Text> : <></>}
            {line3 != ''? <Text> {line3} </Text> : <></>}
          </VStack> 
        </Button>
      </PopoverTrigger>
      <PopoverContent width='fit-content' fontSize='14px'>
        <PopoverArrow/>
        <PopoverHeader> Inicio: {hhmm_format(hori[0], hori[1])} </PopoverHeader>
        <PopoverHeader> Fin: {hhmm_format(horf[0], horf[1])} </PopoverHeader>
      </PopoverContent>
    </Popover>

    
  )
}
// label={hori[0].toString()+':'+hori[1].toString()+' - '+horf[0].toString()+':'+horf[1].toString()}

export default Card;