/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { BaseLayout } from "./BaseLayout";
import {
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  ListItemButton,
} from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import DescriptionIcon from "@mui/icons-material/Description";
import { Outlet, useNavigate } from "react-router";
import { ROUTING } from "../constants/routing";
import { getPatientInfo } from "../services/paciente/paciente";
import { useDispatch } from "react-redux";
import { setProfile } from "../stores/slices/user.slice";

export default function PatientLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentTitle, setCurrentTitle] = useState("Meus Agendamentos");
  const titleMap: Record<string, string> = {
    appointments: "Meus Agendamentos",
    "find-doctor": "Encontrar Médico",
    "medical-records": "Meus Prontuários",
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.userId || user.id;

    const fetchPatient = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      const response = await getPatientInfo(userId);
      const paciente = response.data.data;

      if (!paciente?.id) {
        navigate(ROUTING.PROFILE, { state: { openModal: true } });
      } else {
        dispatch(setProfile(paciente));
      }
    };

    fetchPatient();
  }, [navigate, dispatch]);

  useEffect(() => {
    if (location.pathname === ROUTING.PACIENTE) {
      navigate(ROUTING.APPOINTMENTS);
      setCurrentTitle(titleMap["appointments"]);
    }
  }, [location.pathname, navigate]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setCurrentTitle(titleMap[path]);
  };

  const sidebarContent = (
    <>
      <List>
        <ListItemButton onClick={() => handleNavigation(ROUTING.APPOINTMENTS)}>
          <ListItemIcon>
            <EventNoteIcon />
          </ListItemIcon>
          <ListItemText primary="Agendamentos" />
        </ListItemButton>
      </List>
      <Divider />
      <List>
        <ListItemButton
          onClick={() => handleNavigation(ROUTING.MEDICAL_RECORDS)}
        >
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary="Pontos" />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <BaseLayout title={`${currentTitle}`} sidebarContent={sidebarContent}>
      <Outlet />
    </BaseLayout>
  );
}
