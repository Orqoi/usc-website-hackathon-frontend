import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import {
  Box,
  HStack,
  VStack,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  Button,
  MenuOptionGroup,
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/react';

import eachMinuteOfInterval from 'date-fns/eachMinuteOfInterval';

import { BookingConfirmationPopup } from '../components/booking/BookingConfirmationPopup';
import { BookingsContext, BookingsContextValue } from './BookingsContext';
import { sub } from 'date-fns';
import { SingleDatepicker } from 'chakra-dayzed-datepicker';
import Footer from '../components/Footer';
import { NextPage } from 'next';
import NavMenu from '../components/NavMenu';
import { useLocalStorage } from '../components/swr-internal-state-main';
import Calendar from '../components/Calendar';
import { ChevronDownIcon } from '@chakra-ui/icons';
import BookingsTimesCol from '../components/booking/BookingTimesCol';
import BookingVenueCol from '../components/booking/BookingVenueCol';

const BOX_HEIGHT = 8; // Ensures time labels are aligned with grid cells
const VENUES = ['CTPH', 'Chatterbox', "Maker's Studio", 'Amphi', 'TRR', 'TRB'];

const useUserInfo = () => useLocalStorage<AuthState>('token-value');

const BookingSelector: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [bookingDataFromSelection, setBookingDataFromSelection] = useState<BookingDataSelection>({
    start: null,
    end: null,
    venueId: -1,
    venueName: '',
  });
  const [unsuccessfulFormSubmitString, setUnsuccessfulFormSubmitString] = useState<string>('');
  const [startDate, setStartDate] = React.useState<Date>(new Date());
  const [auth] = useUserInfo();
  const [bookingData, setBookingData] = useState<BookingDataForm>({
    event: '',
    orgId: auth ? auth.orgIds[0] : -1,
  });
  const toast = useToast();
  const toast_id = 'auth-toast';
  const [allBookings, setAllBookings] = useState<BookingDataBackend[]>([]);

  useEffect(() => {
    (async () => {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startDate);
      endOfDay.setHours(23, 59, 59, 999);
      const currentBookings = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL +
          'bookings/all?start=' +
          startOfDay.toISOString() +
          '&end=' +
          endOfDay,
      );
      const allBookings = await currentBookings.json();
      console.log(allBookings);
      setAllBookings(allBookings);
    })();
    return () => {};
  }, [startDate]);

  // Create time intervals for the current date
  const timeIntervals = (() => {
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    const day = startDate.getDate();
    return eachMinuteOfInterval(
      {
        start: new Date(year, month, day, 0),
        end: new Date(year, month, day, 23, 59),
      },
      { step: 30 },
    );
  })();

  const venueBookings: Array<Array<BookingDataDisplay>> = new Array(6)
    .fill(0)
    .map(() => new Array(0));
  // Convert the bookings from the backend into a format that can be used by the grid
  // Filter bookings to only show bookings for the current day and the current venue
  allBookings
    .map((booking) => ({
      ig: booking.orgId.toString(),
      venueId: booking.venueId,
      bookedBy: booking.userId.toString(),
      // Subtract 1 minute to the start time to properly display the booking
      from: sub(Date.parse(booking.start), { minutes: 1 }),
      to: new Date(booking.end),
    }))
    // TODO fix, this is broken for some strange reason cuz of the +8; we do not need it anyways because we specify
    //  start and end to backend now, but good to have
    // .filter((booking) => isSameDay(booking.to, timeIntervals[0]))
    .reduce(function (memo, x) {
      memo[x['venueId'] - 1].push(x);
      return memo;
    }, venueBookings);

  const onModalClose = () => {
    setUnsuccessfulFormSubmitString('');
    setBookingData({
      event: '',
      orgId: auth ? auth.orgIds[0] : -1,
    });
    onClose();
  };

  const onModalOpen = () => {
    if (!auth || auth.token === '') {
      if (!toast.isActive(toast_id)) {
        toast({
          id: toast_id,
          title: `You need to login to make a booking!`,
          position: 'top',
          duration: 3000,
          status: 'error',
          isClosable: true,
        });
      }
    } else {
      setBookingData({
        event: '',
        orgId: auth ? auth.orgIds[0] : -1,
      });
      onOpen();
    }
  };

  return (
    <VStack px={12} py={4} alignItems={'start'}>
      {auth ? (
        <BookingConfirmationPopup
          isOpen={isOpen}
          onClose={onModalClose}
          startDate={startDate}
          setUnsuccessfulFormSubmitString={setUnsuccessfulFormSubmitString}
          unsuccessfulFormSubmitString={unsuccessfulFormSubmitString}
          bookingDataFromSelection={bookingDataFromSelection}
          bookingData={bookingData}
          setBookingData={setBookingData}
          auth={auth}
        />
      ) : (
        <></>
      )}
      <Box maxWidth={'125px'}></Box>

      {/* Different tabs for day and month view */}
      <Tabs variant='solid-rounded' colorScheme='blue'>
        <TabList w={320}>
          {/* Hardcoded values for width - to be updated */}
          <SingleDatepicker name='date-input' date={startDate} onDateChange={setStartDate} />
          <motion.div whileHover={{ scale: 1.1 }}>
            <Tab mx={4}>Day</Tab>
          </motion.div>
          <Tab>Month</Tab>
        </TabList>
        <TabPanels>
          {/* Day view */}
          <TabPanel>
            <HStack>
              <BookingsTimesCol boxHeight={BOX_HEIGHT} />
              {VENUES.map((venueName, venueId) => (
                <BookingVenueCol
                  timeIntervals={timeIntervals}
                  key={venueName}
                  venueName={venueName}
                  openBookingModal={(start, end) => {
                    setBookingDataFromSelection({
                      ...bookingDataFromSelection,
                      venueName,
                      venueId: venueId + 1,
                      start,
                      end,
                    });
                    onModalOpen();
                  }}
                  bookingModalIsOpen={isOpen}
                  currentVenueBookings={venueBookings[venueId]}
                  boxHeight={BOX_HEIGHT}
                />
              ))}
            </HStack>
          </TabPanel>
          {/* Month view */}
          <TabPanel>
            <Menu closeOnSelect={false}>
              <MenuButton as={Button} colorScheme='blue' rightIcon={<ChevronDownIcon />}>
                Venue
              </MenuButton>
              <MenuList>
                <MenuOptionGroup defaultValue={VENUES[0]} type='radio'>
                  {VENUES.map((venue) => (
                    <MenuItemOption key={venue} value={venue}>
                      {venue}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
            <Calendar />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

const Grid: NextPage<{ allBookings: BookingDataBackend[]; allOrgs: OrgInfo[] }> = ({
  allBookings,
  allOrgs,
}) => {
  return (
    <Flex justify='center' flexDir='column' as='main'>
      <NavMenu />
      <BookingsContext.Provider value={{ allOrgs }}>
        <BookingSelector />
      </BookingsContext.Provider>
      <Footer />
    </Flex>
  );
};

// TODO we should use getStaticProps here
export async function getServerSideProps() {
  const orgs = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + 'orgs');
  const allOrgs = await orgs.json();
  return { props: { allOrgs } };
}

export default Grid;
