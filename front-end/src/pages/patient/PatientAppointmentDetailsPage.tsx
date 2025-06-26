/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Avatar,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import DescriptionIcon from "@mui/icons-material/Description";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CancelIcon from "@mui/icons-material/Cancel";
import MedicalRecordModal from "../../components/medical/MedicalRecordModal";
import {
  formatTimeFromTimeString,
  parseDateTimeFromString,
} from "../../utils/dateUtils";
import { useNavigate } from "react-router";
import { ROUTING } from "../../constants/routing";

/**
 * Página de detalhes da consulta do paciente
 * Exibe informações sobre a consulta, médico responsável e permite visualizar o prontuário médico relacionado
 */
const PatientAppointmentDetailsPage: React.FC = () => {
  // Obtém o ID da consulta dos parâmetros da URL
  const { appointmentId } = useParams<{ appointmentId: string }>();
  // Estado para armazenar informações da consulta
  const [appointment, setAppointment] = useState<any>(null);
  // Estado para indicar carregamento
  const [loading, setLoading] = useState(true);
  // Estado para controlar exibição do modal do prontuário médico
  const [isMedicalRecordOpen, setIsMedicalRecordOpen] =
    useState<boolean>(false);
  const user = useSelector((state: any) => state.user);
  const navigate = useNavigate();
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancellationSuccess, setCancellationSuccess] = useState(false);
  const [hasBankAccount, setHasBankAccount] = useState<boolean>(false);

  const getStatus = (status: string) => {
    switch (status) {
      case "WAITING":
        return "Aguardando";
      case "IN_PROGRESS":
        return "Em atendimento";
      case "DONE":
        return "Concluído";
      case "CANCELLED":
        return "Cancelado";
      default:
        return "default";
    }
  };

  const fetchAppointmentDetails = async () => {
    try {
      if (!appointmentId) {
        setLoading(false);
        return;
      }
      const result = await getAppointmentPatientDetail(
        user.userId,
        Number(appointmentId)
      )
        .then((response) => response.data.data)
        .catch((error) => {
          console.error("Erro ao carregar informações da consulta:", error);
          setLoading(false);
        });

      const data = {
        id: result.book_appointment.id,
        workScheduleId: result.work_schedule.id,
        date: result.work_schedule.dateAppointment,
        time: `${formatTimeFromTimeString(
          result.work_schedule.shift.start,
          "string"
        )} - ${formatTimeFromTimeString(
          result.work_schedule.shift.end,
          "string"
        )}`,
        status: getStatus(result.book_appointment.status),
        patientInfo: {
          id: result.book_appointment.patientId,
          numericalOrder: result.book_appointment.numericalOrder,
        },
        doctorInfo: {
          id: result.work_schedule.doctor.userId,
          name: `${result.work_schedule.doctor.firstName} ${result.work_schedule.doctor.lastName}`,
          typeDisease: result.work_schedule.doctor.typeDisease.name,
          avatar: result.work_schedule.doctor.avatar,
          specialization: result.work_schedule.doctor.specialization || "",
        },
        hasMedicalRecord: true,
        createdAt: result.book_appointment.createdAt,
      };
      setAppointment(data);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar informações da consulta:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentDetails();

    // Verifica se o paciente possui conta bancária
    const checkBankAccount = async () => {
      try {
        const response = await getPatientBankAccount(user.userId);
        setHasBankAccount(response.data.code === 200);
      } catch (error) {
        console.error("Erro ao verificar conta bancária:", error);
        setHasBankAccount(false);
      }
    };

    checkBankAccount();
  }, [appointmentId, cancellationSuccess, user.userId]);

  // Exibe carregando
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Exibe mensagem caso não encontre a consulta
  if (!appointment) {
    return (
      <Box p={3}>
        <Typography variant="h5">
          Informações da consulta não encontradas
        </Typography>
      </Box>
    );
  }

  /**
   * Define a cor do status da consulta
   * @param status - Status da consulta
   * @returns Cor correspondente ao status
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em atendimento":
        return "success";
      case "Aguardando":
        return "warning";
      case "Concluído":
        return "info";
      case "Cancelado":
        return "error";
      default:
        return "default";
    }
  };

  /**
   * Abre o modal do prontuário médico
   */
  const handleOpenMedicalRecord = () => {
    setIsMedicalRecordOpen(true);
  };

  /**
   * Verifica se a consulta pode acessar a sala online
   * Apenas status "Aguardando" ou "Em atendimento"
   */
  const canJoinExamination = (status: string) => {
    if (!(status === "Em atendimento" || status === "Aguardando")) {
      return false;
    }

    try {
      const today = new Date();
      const [day, month, year] = appointment.date.split("-").map(Number);
      const appointmentDate = new Date(year, month - 1, day);

      const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const appointmentDateOnly = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate()
      );
      if (todayDate.getTime() !== appointmentDateOnly.getTime()) {
        return false;
      }

      const timeString = appointment.time;
      const [startTimeStr, endTimeStr] = timeString.split(" - ");

      const [startHour, startMinute] = startTimeStr.split(":").map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;

      const [endHour, endMinute] = endTimeStr.split(":").map(Number);
      const endTimeInMinutes = endHour * 60 + endMinute;

      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      return (
        currentTimeInMinutes >= startTimeInMinutes &&
        currentTimeInMinutes <= endTimeInMinutes
      );
    } catch (error) {
      console.error("Erro ao verificar horário da consulta:", error);
      return false;
    }
  };

  /**
   * Verifica se a consulta pode ser cancelada
   * Só permite cancelar se foi marcada há menos de 24h e tem conta bancária
   */
  const canCancelAppointment = (createdAt: string, status: string) => {
    if (status !== "Aguardando") return false;

    try {
      const createdDate = parseDateTimeFromString(createdAt);
      const now = new Date();

      const timeDiff = now.getTime() - createdDate.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      return hoursDiff <= 24;
    } catch (error) {
      console.error("Erro ao processar datas:", error);
      return false;
    }
  };

  /**
   * Abre o diálogo de confirmação de cancelamento
   */
  const handleOpenCancelDialog = () => {
    setOpenCancelDialog(true);
  };

  /**
   * Fecha o diálogo de confirmação de cancelamento
   */
  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
  };

  /**
   * Cancela a consulta
   */
  const handleCancelAppointment = async () => {
    try {
      if (!hasBankAccount) {
        alert(
          "Você precisa ter uma conta bancária para cancelar a consulta. Por favor, entre em contato com o hospital para mais detalhes."
        );
        return;
      }
      await cancelAppointment(appointment.id);
      setCancellationSuccess(true);
      handleCloseCancelDialog();
      fetchAppointmentDetails();
    } catch (error) {
      console.error("Erro ao cancelar consulta:", error);
    }
  };

  return (
    <Box p={3}>
      {/* Título da página */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Detalhes da consulta
      </Typography>

      {/* Card de detalhes da consulta */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5">
              Informações da consulta #{appointment.id}
            </Typography>
            {/* Status da consulta */}
            <Chip
              label={appointment.status}
              color={getStatusColor(appointment.status) as any}
              sx={{ fontWeight: "bold" }}
            />
          </Box>

          {/* Número de ordem do paciente */}
          <Box mb={2}>
            <Chip
              label={`Número de ordem: ${appointment.patientInfo.numericalOrder}`}
              color="primary"
              sx={{
                fontWeight: "medium",
                fontSize: "1rem",
                py: 0.5,
                "& .MuiChip-label": { px: 2 },
              }}
            />
          </Box>

          {/* Data, hora */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} display="flex" alignItems="center">
              <EventIcon sx={{ mr: 1, color: "primary.main" }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Data da consulta
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {appointment.date}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4} display="flex" alignItems="center">
              <AccessTimeIcon sx={{ mr: 1, color: "primary.main" }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Horário
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {appointment.time}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Motivo da consulta */}
          <Box mt={3}>
            <Typography variant="body2" color="text.secondary">
              Motivo da consulta
            </Typography>
            <Typography variant="body1">
              {appointment.doctorInfo.typeDisease}
            </Typography>
          </Box>

          {/* Botões */}
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            {appointment.status === "Aguardando" && !hasBankAccount ? (
              <Tooltip title="Você precisa ter uma conta bancária para cancelar a consulta">
                <span>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    disabled={true}
                  >
                    Cancelar consulta
                  </Button>
                </span>
              </Tooltip>
            ) : (
              canCancelAppointment(
                appointment.createdAt,
                appointment.status
              ) && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleOpenCancelDialog}
                >
                  Cancelar consulta
                </Button>
              )
            )}
            {canJoinExamination(appointment.status) && (
              <Button
                variant="contained"
                color="success"
                startIcon={<VideoCallIcon />}
                onClick={(event) =>
                  handleJoinExamination(
                    appointment.id,
                    appointment.workScheduleId,
                    appointment.date,
                    event,
                    appointment.doctorInfo.id,
                    appointment.doctorInfo.name,
                    appointment.patientInfo.numericalOrder
                  )
                }
              >
                Entrar na consulta
              </Button>
            )}
            {appointment.hasMedicalRecord && (
              <Button
                variant="contained"
                startIcon={<DescriptionIcon />}
                onClick={handleOpenMedicalRecord}
              >
                Ver prontuário
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Informações do médico */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Informações do médico responsável
          </Typography>

          <Box display="flex" alignItems="flex-start" mt={2}>
            {/* Avatar do médico */}
            <Avatar
              src={appointment.doctorInfo.avatar}
              alt={appointment.doctorInfo.name}
              sx={{ width: 80, height: 80, mr: 3 }}
            >
              <PersonIcon fontSize="large" />
            </Avatar>

            <Box>
              {/* Nome do médico */}
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {appointment.doctorInfo.name}
              </Typography>

              {/* Especialidade */}
              <Box display="flex" alignItems="center" mt={1}>
                <LocalHospitalIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "text.secondary" }}
                />
                <Typography variant="body1">
                  {appointment.doctorInfo.specialization}
                </Typography>
              </Box>

              {/* Grau acadêmico */}
              <Typography variant="body2" color="text.secondary" mt={1}>
                {appointment.doctorInfo.degree}
              </Typography>

              {/* Experiência */}
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {appointment.doctorInfo.experience}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Diálogo de confirmação de cancelamento */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          Confirmar cancelamento da consulta
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Tem certeza que deseja cancelar esta consulta? Esta ação não pode
            ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} color="primary">
            Voltar
          </Button>
          <Button
            onClick={handleCancelAppointment}
            color="error"
            variant="contained"
          >
            Confirmar cancelamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientAppointmentDetailsPage;
