import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

/**
 * Props para o componente ConfirmAppointment
 * @param date - Data da consulta selecionada
 * @param time - Horário da consulta selecionado
 * @param doctor - Informações do médico selecionado
 * @param specialty - Informações do serviço/especialidade selecionado (opcional)
 * @param onDone - Função callback quando o usuário finaliza o agendamento
 */
interface ConfirmAppointmentProps {
  date: Date;
  time: { start: string; end: string };
  doctor: any;
  specialty?: any;
  onDone: () => void;
}

/**
 * Componente que exibe a tela de confirmação de agendamento bem-sucedido
 * Mostra um resumo das informações do agendamento: data, hora, médico e serviço
 */
const ConfirmAppointment: React.FC<ConfirmAppointmentProps> = ({
  date,
  time,
  doctor,
  specialty,
  onDone,
}) => {
  return (
    <Box sx={{ textAlign: "center", py: 3 }}>
      {/* Ícone de agendamento bem-sucedido */}
      <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />

      {/* Mensagem de agendamento bem-sucedido */}
      <Typography variant="h5" gutterBottom>
        Agendamento realizado com sucesso!
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Sua consulta foi agendada. Você receberá um lembrete próximo ao horário
        marcado.
      </Typography>

      {/* Caixa com detalhes do agendamento */}
      <Paper sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detalhes do agendamento
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Lista de detalhes */}
        <List>
          {/* Data da consulta */}
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <EventIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Data"
              secondary={date.toLocaleDateString("pt-BR")}
            />
          </ListItem>

          {/* Horário da consulta */}
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <AccessTimeIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Horário"
              secondary={time.start + " - " + time.end}
            />
          </ListItem>

          {/* Informações do médico */}
          <ListItem>
            <ListItemAvatar>
              <Avatar src={doctor.avatar ?? ""}>
                <PersonIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Médico"
              secondary={`${doctor.firstName} ${doctor.lastName}`}
            />
          </ListItem>

          {/* Informações do serviço (se houver) */}
          {specialty && (
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <LocalHospitalIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Serviço" secondary={specialty.name} />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Botão para voltar à página de agendamentos */}
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onDone}
          size="large"
        >
          Voltar para meus agendamentos
        </Button>
      </Box>
    </Box>
  );
};

export default ConfirmAppointment;
