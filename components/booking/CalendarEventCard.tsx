import {
  Card,
  CardHeader,
  CardBody,
  Text,
  Icon,
  VStack,
  Box,
  HStack,
  Center,
  CardFooter,
  Button,
} from '@chakra-ui/react';
import { FaRegCalendarAlt, FaRegBuilding, FaRegClock, FaRegUser, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

import { VENUES } from './CONSTANTS';

interface CalendarEventCardProps extends React.HTMLProps<HTMLDivElement> {
  x: number;
  y: number;
  booking: BookingDataDisplay | null;
  onDelete: () => void;
}

const CalendarEventCard: React.FC<CalendarEventCardProps> = ({ x, y, booking, onDelete }) => {
  if (!booking) {
    return <></>;
  }

  return (
    <motion.div
      style={{ position: 'fixed', zIndex: 20, top: 0, left: 0 }}
      initial={{ x: x - 20, y: y - 100, opacity: 0 }}
      animate={{ x: x, y: y - 100, opacity: 1 }}
      exit={{ x: x - 20, opacity: 0, transition: { duration: 0.2 } }}
      transition={{
        duration: 0.7,
        ease: [0.2, 0.8, 0.2, 1],
        opacity: {
          duration: 0.2,
          ease: 'easeOut',
        },
      }}
    >
      <Card w='sm' rounded='none' boxShadow='xl' bg='white'>
        <CardHeader pb='0'>
          <HStack>
            <Center bg='brand.primary' w='6' h='6' p='2'>
              <Icon as={FaRegCalendarAlt} color='white' />
            </Center>
            <Text as='h2' fontSize='2xl' fontWeight='bold' color='brand.primary' display='inline'>
              Event Name
            </Text>
          </HStack>
        </CardHeader>
        <CardBody pt='4'>
          <VStack alignItems='flex-start'>
            <HStack>
              <Icon as={FaRegClock} />
              <Text as='span' fontSize='sm'>
                {`${format(booking.from, 'dd MMM, h:mm a')} - ${format(booking.to, 'h:mm a')}`}
              </Text>
            </HStack>

            <HStack>
              <Icon as={FaRegUser} />
              <Text as='span' fontSize='sm'>
                {booking.bookedBy}
              </Text>
            </HStack>
            <HStack>
              <Icon as={FaRegBuilding} />
              <Text as='span' fontSize='sm'>
                {VENUES[booking.venueId]}
              </Text>
            </HStack>
          </VStack>
        </CardBody>
        <CardFooter justify='flex-end' pt='0'>
          <Button
            size='sm'
            variant='outline'
            _hover={{ transform: 'scale(1.2)' }}
            _active={{ transform: 'scale(0.9)' }}
            onClick={onDelete}
          >
            <Icon as={FaTrash} color='gray.500' />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CalendarEventCard;
