import React from "react";
import { BaseLayout } from "./BaseLayout";
import {
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import { useNavigate } from "react-router";
import { Outlet } from "react-router";

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const sidebarContent = (
    <>
      <List>
        <ListItemButton onClick={() => handleNavigation("/admin/dashboard")}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Estatísticas" />
        </ListItemButton>
        <ListItemButton onClick={() => handleNavigation("/admin/users")}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Gerenciar pacientes" />
        </ListItemButton>
        <ListItemButton onClick={() => handleNavigation("/admin/doctors")}>
          <ListItemIcon>
            <LocalHospitalIcon />
          </ListItemIcon>
          <ListItemText primary="Gerenciar médicos" />
        </ListItemButton>
        {/* Gerenciar agendamentos */}
        <ListItemButton
          onClick={() => handleNavigation("/admin/cancel-appointment")}
        >
          <ListItemIcon>
            <EventBusyIcon />
          </ListItemIcon>
          <ListItemText primary="Gerenciar agendamentos" />
        </ListItemButton>
        {/* Gerenciar preços */}
        <ListItemButton onClick={() => handleNavigation("/admin/prices")}>
          <ListItemIcon>
            <AttachMoneyIcon />
          </ListItemIcon>
          <ListItemText primary="Gerenciar preços" />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <BaseLayout title="Painel Administrativo" sidebarContent={sidebarContent}>
      <Outlet />
    </BaseLayout>
  );
};

export default AdminLayout;
