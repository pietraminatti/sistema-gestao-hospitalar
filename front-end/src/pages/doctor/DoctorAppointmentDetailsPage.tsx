import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  Box,
  Typography,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Stack,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VideocamIcon from "@mui/icons-material/Videocam";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { ROUTING } from "../../constants/routing";

// Calcular idade (formato dd-MM-yyyy)
const calculateAge = (dobString: string) => {
  const parts = dobString.split("-");
  if (parts.length !== 3) return 0;

  const dob = new Date(
    parseInt(parts[2]),
    parseInt(parts[1]) - 1,
    parseInt(parts[0])
  );
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Página de detalhes do agendamento do médico
 * Exibe informações sobre o agendamento e a lista de pacientes registrados
 */
const DoctorAppointmentDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  // Pega o ID do agendamento dos parâmetros da URL (scheduleId)
  const { scheduleId } = useParams<{ scheduleId: string }>();
  // Estado para armazenar informações do agendamento
  const [workSchedule, setWorkSchedule] = useState<any>(null);
  // Estado para indicar carregamento
  const [loading, setLoading] = useState(true);
  // Estado para armazenar termo de busca
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Doctor ID normalmente vem do contexto de autenticação
  const doctorId = useSelector((state: any) => state.user.user).userId;
  // Estado para modal de prontuário médico
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isMedicalRecordOpen, setIsMedicalRecordOpen] =
    useState<boolean>(false);

  useEffect(() => {
    // Chamada real à API para buscar detalhes do agendamento
    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true);
        // Converte appointmentId de string para número
        const workScheduleId = Number(scheduleId);
        if (isNaN(workScheduleId)) {
          throw new Error("ID do agendamento inválido");
        }

        const response = await getDetailDoctorAppointment(
          doctorId,
          workScheduleId
        );
        console.log("Resposta da API:", response);
        // Transforma resposta da API para o formato esperado
        const responseData = response.data.data;
        const workSchedule = responseData.work_schedule;

        // Formata hora de hh-mm-ss para hh:mm
        const formatTime = (timeStr: string) => {
          const parts = timeStr.split("-");
          return `${parts[0]}:${parts[1]}`;
        };

        // Mapeia dados dos pacientes
        const transformedPatients = responseData.patients.map(
          (patient: any) => ({
            id: patient.user_info.userId,
            numericalOrder: patient.book_appointment.numericalOrder.toString(),
            medicalId: patient.user_info.userId.substring(0, 10),
            name: `${patient.user_info.lastName} ${patient.user_info.firstName}`,
            age: calculateAge(patient.user_info.dob),
            gender: patient.user_info.sex ? "Feminino" : "Masculino",
            bookAppointmentId: patient.book_appointment.id,
          })
        );

        const transformedData = {
          id: workSchedule.id.toString(),
          doctorName: `${workSchedule.doctor.firstName} ${workSchedule.doctor.lastName}`,
          date: workSchedule.dateAppointment,
          time: `${formatTime(workSchedule.shift.start)} - ${formatTime(
            workSchedule.shift.end
          )}`,
          totalSlots: workSchedule.maxSlots,
          registeredPatients: transformedPatients,
        };

        setWorkSchedule(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar informações do agendamento:", error);
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [scheduleId, doctorId]);

  // Exibe estado de carregamento
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

  // Exibe mensagem quando não encontra informações do agendamento
  if (!workSchedule) {
    return (
      <Box p={3}>
        <Typography variant="h5">
          Não foi possível encontrar informações do agendamento
        </Typography>
      </Box>
    );
  }

  /**
   * Filtra lista de pacientes pelo número de ordem
   * @returns Lista de pacientes filtrada
   */
  const filteredPatients =
    searchQuery.trim() === ""
      ? workSchedule.registeredPatients
      : workSchedule.registeredPatients.filter((patient: any) =>
          patient.numericalOrder
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

  /**
   * Limpa o termo de busca
   */
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  /**
   * Abre modal de prontuário médico para o paciente selecionado
   * @param patientId - ID do paciente
   */
  const handleOpenMedicalRecord = (patient) => {
    setSelectedPatient(patient);
    setIsMedicalRecordOpen(true);
  };

  /**
   * Fecha modal de prontuário médico
   */
  const handleCloseMedicalRecord = () => {
    setIsMedicalRecordOpen(false);
    setSelectedPatient(null);
  };

  /**
   * Verifica se uma data já passou (para controlar botão "Iniciar Consulta")
   */
  const isPastDate = (dateString: string): boolean => {
    // Converte string de data para objeto Date
    const parts = dateString.split("-");
    const date = new Date(
      parseInt(parts[2]), // ano
      parseInt(parts[1]) - 1, // mês (0-based)
      parseInt(parts[0]) // dia
    );
    // Compara com a data atual (ignora hora, minuto, segundo)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  /**
   * Verifica se a data atual é igual à data do agendamento
   */
  const isAppointmentDate = (dateString: string): boolean => {
    // Converte string de data (dd-MM-yyyy) para objeto Date
    const parts = dateString.split("-");
    const appointmentDate = new Date(
      parseInt(parts[2]), // ano
      parseInt(parts[1]) - 1, // mês (0-based)
      parseInt(parts[0]) // dia
    );

    // Pega a data atual (ignora hora, minuto, segundo)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    // Compara a data atual com a data do agendamento
    return today.getTime() === appointmentDate.getTime();
  };

  /**
   * Verifica se o horário atual está dentro do turno do agendamento
   */
  const isWithinShiftHours = (timeRange: string): boolean => {
    // Divide o intervalo de tempo "10:00 - 12:00" para pegar início e fim
    const [startTimeStr, endTimeStr] = timeRange.split(" - ");

    // Converte as strings de hora para objetos Date
    const now = new Date();
    const currentDate = new Date();

    // Cria objetos Date para início e fim
    const startTime = new Date(currentDate);
    const endTime = new Date(currentDate);

    // Define horas e minutos para início
    const [startHour, startMinute] = startTimeStr.split(":").map(Number);
    startTime.setHours(startHour, startMinute, 0);

    // Define horas e minutos para fim
    const [endHour, endMinute] = endTimeStr.split(":").map(Number);
    endTime.setHours(endHour, endMinute, 0);

    // Verifica se o horário atual está dentro do intervalo
    return now >= startTime && now <= endTime;
  };

  /**
   * Lida com a navegação para a sala de consulta online
   */
  const handleStartExamination = () => {
    if (!workSchedule || !scheduleId) {
      console.error("Informações do agendamento inválidas");
      alert(
        "Não foi possível abrir a sala de consulta devido à falta de informações do agendamento. Por favor, tente novamente."
      );
      return;
    }

    // Verifica se a data do agendamento já passou
    const isDateInPast = isPastDate(workSchedule.date);
    if (isDateInPast) {
      alert("Não é possível iniciar a consulta pois a data já passou");
      return;
    }

    // Verifica se a data atual é a data do agendamento
    if (!isAppointmentDate(workSchedule.date)) {
      alert("Só é possível iniciar a consulta na data agendada");
      return;
    }

    // Verifica se o horário atual está dentro do turno do agendamento
    const isWithinShift = isWithinShiftHours(workSchedule.time);
    if (!isWithinShift) {
      alert(
        "Só é possível iniciar a consulta dentro do horário do agendamento"
      );
      return;
    }

    // Cria URL da sala de consulta com o ID do agendamento
    const examRoomPath = ROUTING.EXAMINATION_ROOM.replace(
      ":scheduleId",
      scheduleId.toString()
    );

    // Abre a página da consulta em uma nova aba
    window.open(examRoomPath, "_blank");
  };

  return (
    <Box p={3}>
      {/* Título da página */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Detalhes do agendamento
      </Typography>

      {/* Card com informações do agendamento */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5">Informações do agendamento</Typography>
          </Box>

          {/* Informações detalhadas: data, hora */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} display="flex" alignItems="center">
              <EventIcon sx={{ mr: 1, color: "primary.main" }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Data da consulta
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {workSchedule.date}
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
                  {workSchedule.time}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Botão para iniciar consulta */}
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="success"
              startIcon={<VideocamIcon />}
              onClick={handleStartExamination}
            >
              Iniciar consulta
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Lista de pacientes registrados */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            mb={2}
            alignItems="center"
          >
            <Typography variant="h5">Pacientes registrados</Typography>
            {/* Exibe quantidade de pacientes registrados */}
            <Box>
              <Chip
                label={`${workSchedule.registeredPatients.length}/${workSchedule.totalSlots} pacientes`}
                color="primary"
              />
            </Box>
          </Box>

          {/* Barra de busca por número de ordem */}
          <Box mb={3}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Buscar por número de ordem"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      aria-label="Limpar busca"
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {filteredPatients.length > 0 ? (
            <List>
              {/* Itera sobre pacientes e exibe informações */}
              {filteredPatients.map((patient: any, index: number) => (
                <React.Fragment key={patient.id}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    {/* Avatar com a inicial do nome */}
                    <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                      {patient.name[0]}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight="bold">
                          {patient.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          {/* Exibe número de ordem */}
                          <Typography
                            variant="body2"
                            color="primary"
                            sx={{ fontWeight: "medium" }}
                          >
                            Número de ordem: {patient.numericalOrder}
                          </Typography>
                          {/* Informações básicas */}
                          <Typography component="span" variant="body2">
                            {patient.age} anos • {patient.gender}
                          </Typography>
                        </>
                      }
                    />
                    {/* Coluna de botões de ação */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 1,
                      }}
                    >
                      <Stack spacing={1}>
                        {/* Botão para ver prontuário */}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleOpenMedicalRecord(patient)}
                          fullWidth
                        >
                          Ver prontuário
                        </Button>
                      </Stack>
                    </Box>
                  </ListItem>
                  {/* Divider entre pacientes */}
                  {index < filteredPatients.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            // Exibe mensagem se não houver pacientes ou resultado da busca
            <Typography variant="body1" textAlign="center" py={3}>
              {searchQuery.trim() !== ""
                ? "Nenhum paciente encontrado com esse número de ordem"
                : "Nenhum paciente registrado para este agendamento"}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DoctorAppointmentDetailsPage;
