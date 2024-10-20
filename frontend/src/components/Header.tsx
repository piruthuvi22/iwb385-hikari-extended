import { Box, IconButton, LinearProgress, Typography } from '@mui/material';
import { theme } from '../theme/theme';
import LogoHorz from '../assets/hlogowhite.svg';
import GroupIcon from '@mui/icons-material/Group';
import { Link } from 'react-router-dom';

const Header = ({
  title,
  loading,
  buttonComponent,
}: {
  title: string;
  loading: boolean;
  buttonComponent?: React.ReactNode;
}) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {loading && (
        <Box position={'fixed'} top={0} left={0} right={0}>
          <LinearProgress color='secondary' sx={{ height: 6 }} />
        </Box>
      )}
      <Box
        sx={{
          height: '18vh',
          backgroundImage: `linear-gradient(to right bottom, ${theme.palette.primary.main},  ${theme.palette.secondary.main})`,
          borderBottomLeftRadius: '2.5rem',
          borderBottomRightRadius: '2.5rem',
        }}
      >
        <Box
          position='absolute'
          bottom='0'
          display={'grid'}
          justifyContent=''
          width='100%'
        >
          <Box display='flex' justifyContent='space-between'>
            <img
              src={LogoHorz}
              alt='Banner'
              style={{
                width: 150,
                height: 80,
                padding: 10,
                paddingLeft: 20,
              }}
            />
            {buttonComponent && (
              <Box height='100%' display='grid' alignContent='center' mr={1.5} mt={-0.5}>
                {buttonComponent}
              </Box>
            )}
          </Box>
          <Typography textAlign='center' color='white' variant='h4' pb={2}>
            {title}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
