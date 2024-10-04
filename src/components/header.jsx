import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { logout } from '../db/apiAuth';
import { UrlState } from '../context';
import useFetch from '../hooks/use-fetch';
import { LinkIcon, LogOut } from 'lucide-react';
import {BarLoader} from "react-spinners";
import {Link} from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const {user, fetchUser} = UrlState();

  const{loading,fn:fnLogout}=useFetch(logout);


  return (
    <>
    <nav className="py-6 px-6 flex justify-between items-center">
      <RouterLink to="/">
        <img src="/logo.png" className='h-16' alt="Trimrr logo" />
      </RouterLink>

      <div className="flex items-center">
        {!user ? (
          <Button onClick={() => navigate("/auth")}>Login</Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="w-10 rounded-full overflow-hidden">
              <Avatar>
                <AvatarImage src={user?.user_metadata?.profile_pic} />
                <AvatarFallback>Pa</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{user?.user_metadata?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                 <Link to="/dashboard">
                   <LinkIcon className='mr-2 h-4 w-4' />
                   My Links

                 </Link>
              
              
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400">

              <span 
              onClick={() =>{
                fnLogout().then(()=>{
                fetchUser();
                 navigate("/");

                });
              }}
                >

                Logout
                </span>
                
           


             
                </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
      {loading && <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />}
      </>
  );
};

export default Header;