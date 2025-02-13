import React from 'react'
import {
  Box,
  Card,
  CardBody,
  Checkbox,
  CheckboxGroup,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'

interface IGSearchFilterProps {
  onInput: React.FormEventHandler<HTMLInputElement>
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  interestGroupCategories: string[]
}

const IGSearchFilter: React.FC<IGSearchFilterProps> = ({
  onInput,
  onChange,
  interestGroupCategories,
}) => {
  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow='hidden'
      variant='outline'
      width='25rem'
      minWidth='25rem'
      margin='0 1rem'
      alignSelf='flex-start'
      boxShadow='1px 1px #e9e9e9'
      color='#a1a1a1'
    >
      <CardBody>
        <InputGroup>
          <InputLeftElement pointerEvents='none'>
            <SearchIcon color='gray.300' />
          </InputLeftElement>
          <Input
            type='text'
            border='none'
            _focusVisible={{ outline: 'none' }}
            style={{ borderBottom: '1px solid #a1a1a1', borderRadius: 0, outline: 'none' }}
            placeholder='Search for groups'
            onInput={onInput}
          />
        </InputGroup>
        <Box p={'2vh'}>
          <CheckboxGroup colorScheme='green' defaultValue={['arts', 'sports', 'gui']}>
            <Stack mt='0.5rem' spacing={[1, 5]} direction={['column', 'column']}>
              {interestGroupCategories.map((category) => (
                <Checkbox onChange={onChange} key={category} value={category}>
                  {category}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        </Box>
      </CardBody>
    </Card>
  )
}

export default IGSearchFilter
