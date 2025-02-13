import type { NextPage } from 'next'
import NavMenu from '../components/NavMenu'
import { Box, Button, Flex, Heading, HStack, SimpleGrid, VStack } from '@chakra-ui/react'
import Footer from '../components/Footer'
import { isUserLoggedIn, useUserInfo } from '../utils'

const AdminPage: NextPage = () => {
  const [auth] = useUserInfo()

  return (
    <Flex justify='center' flexDir='column' as='main'>
      <NavMenu />
      <Button
        size='sm'
        variant='outline'
        _hover={{ transform: 'scale(1.2)' }}
        _active={{ transform: 'scale(0.9)' }}
        onClick={() => {
          if (isUserLoggedIn(auth)) {
            console.log(auth?.token)
          }
        }}
      >
        Get it
      </Button>
      <Footer />
    </Flex>
  )
}

export default AdminPage
