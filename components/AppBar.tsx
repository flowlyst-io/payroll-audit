'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Upload', href: '/upload' },
  { label: 'Worksheet', href: '/worksheet' },
  { label: 'Saved Comparisons', href: '/saved' },
];

export default function AppBar() {
  const pathname = usePathname();

  return (
    <MuiAppBar position="static" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 0, mr: 4, fontWeight: 600 }}
        >
          Payroll Audit
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navItems.map((item) => {
            // Special handling for root path to avoid matching all routes
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  borderBottom: isActive ? '2px solid white' : '2px solid transparent',
                  borderRadius: 0,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
