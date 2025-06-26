import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Stack,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CloseIcon from "@mui/icons-material/Close";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import BookAppointment from "../../components/appointments/BookAppointment";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { viVN } from "@mui/x-date-pickers/locales";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { vi } from "date-fns/locale";
import {
  formatDateToString,
  formatTimeFromTimeString,
} from "../../utils/dateUtils";

// Enum dos dias da semana
enum TypeDay {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

// Enum para períodos do dia
enum TimePeriod {
  MORNING = "morning", // Manhã
  AFTERNOON = "afternoon", // Tarde
}

// Dias da semana
const DAYS_OF_WEEK = [
  { key: TypeDay.MONDAY, label: "Segunda-feira" },
  { key: TypeDay.TUESDAY, label: "Terça-feira" },
  { key: TypeDay.WEDNESDAY, label: "Quarta-feira" },
  { key: TypeDay.THURSDAY, label: "Quinta-feira" },
  { key: TypeDay.FRIDAY, label: "Sexta-feira" },
  { key: TypeDay.SATURDAY, label: "Sábado" },
  { key: TypeDay.SUNDAY, label: "Domingo" },
];

// Interface de agendamento
interface Appointment {
  id: number;
  workScheduleId: number;
  date: string; // Formato: dd-MM-yyyy
  startTime: string; // Formato: HH:mm
  endTime: string; // Formato: HH:mm
  status: "WAITING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  doctorName: string;
  specialization: string;
  reason?: string;
  doctorId?: number;
  typeDay?: TypeDay;
  shiftId?: number;
  numericalOrder?: number;
}

const AppointmentPage = () => {
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const user = useSelector((state: any) => state.user.user);
  const getUserId = user.userId;

  // Estados para exibição do calendário
  const [today] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(today, { weekStartsOn: 1 })
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Estado dos agendamentos
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Buscar agendamentos
  const fetchAppointments = async () => {
    try {
      const weekEnd = addDays(currentWeekStart, 6);

      setAppointments([]);

      const response = await getAppointmentPatientBookInWeek(
        getUserId,
        formatDateToString(currentWeekStart),
        formatDateToString(weekEnd)
      );

      if (!response?.data?.data) {
        setAppointments([]);
        return;
      }

      const result = response.data.data;

      if (!result || result.length === 0) {
        setAppointments([]);
        return;
      }

      const appointmentsData = result.map((item: any) => ({
        id: item.book_appointment.id,
        workScheduleId: item.work_schedule.id,
        date: item.work_schedule.dateAppointment,
        startTime: formatTimeFromTimeString(
          item.work_schedule.shift.start,
          "string"
        ),
        endTime: formatTimeFromTimeString(
          item.work_schedule.shift.end,
          "string"
        ),
        status: item.book_appointment.status,
        doctorName:
          item.work_schedule.doctor.lastName +
          " " +
          item.work_schedule.doctor.firstName,
        specialization: item.work_schedule.doctor.specialization,
        reason: "Consulta " + item.work_schedule.doctor.typeDisease.name,
        doctorId: item.work_schedule.doctor.userId,
        shiftId: item.work_schedule.shift.id,
        numericalOrder: item.book_appointment.numericalOrder,
      }));

      setAppointments(appointmentsData);
    } catch (error) {
      setAppointments([]);
    }
  };

  // Buscar agendamentos ao renderizar ou mudar semana
  useEffect(() => {
    fetchAppointments();
  }, [currentWeekStart, getUserId]);

  // Novo agendamento
  const handleBookingClick = () => {
    setShowBooking(true);
  };

  // Fechar form de agendamento
  const handleBookingClose = () => {
    setShowBooking(false);
    fetchAppointments();
  };

  // Dias da semana atual
  const getDaysInWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(currentWeekStart, i);
      days.push({
        date,
        formattedDate: formatDateToString(date),
        displayDate: format(date, "dd/MM"),
      });
    }
    return days;
  };

  const weekDays = getDaysInWeek();

  // Semana anterior
  const handlePrevWeek = () => {
    setAppointments([]);
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  // Próxima semana
  const handleNextWeek = () => {
    setAppointments([]);
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  // Voltar para semana atual
  const handleGoToCurrentWeek = () => {
    setAppointments([]);
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
  };

  // Exibir intervalo da semana
  const formatWeekRange = () => {
    const weekEnd = addDays(currentWeekStart, 6);
    return `${format(currentWeekStart, "dd/MM/yyyy")} - ${format(
      weekEnd,
      "dd/MM/yyyy"
    )}`;
  };

  // Está na semana atual?
  const isCurrentWeek = () => {
    const actualWeekStart = startOfWeek(today, { weekStartsOn: 1 }).getTime();
    return currentWeekStart.getTime() === actualWeekStart;
  };

  // Modal calendário
  const handleOpenCalendar = () => {
    setCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    setCalendarOpen(false);
  };

  // Selecionar data no calendário
  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    setAppointments([]);
    setCurrentWeekStart(weekStart);
    setCalendarOpen(false);
  };

  // Pode entrar na consulta online?
  const canJoinExamination = (
    status: string,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    const validStatus = status === "IN_PROGRESS" || status === "WAITING";
    if (!validStatus) return false;

    const today = new Date();
    const appointmentDate = date.split("-").reverse().join("-");
    const isSameDate = today.toISOString().split("T")[0] === appointmentDate;
    if (!isSameDate) return false;

    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const startTimeInMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = endTime.split(":").map(Number);
    const endTimeInMinutes = endHour * 60 + endMinute;

    return (
      currentTimeInMinutes >= startTimeInMinutes &&
      currentTimeInMinutes <= endTimeInMinutes
    );
  };

  // Ir para detalhes do agendamento
  const handleAppointmentClick = (appointmentId: number) => {
    navigate(`/patient/appointments/${appointmentId}`);
  };

  // Agendamentos por data e período
  const getAppointmentsForDateAndPeriod = (
    date: string,
    period: TimePeriod
  ): Appointment[] => {
    return appointments.filter((appointment) => {
      if (appointment.date !== date) return false;
      return getShiftPeriod(appointment.startTime) === period;
    });
  };

  // Renderizar agendamentos do período
  const renderPeriodAppointments = (date: string, period: TimePeriod) => {
    const filteredAppointments = getAppointmentsForDateAndPeriod(date, period);

    if (filteredAppointments.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
            py: 2,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            Não há agendamentos
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          width: "100%",
          py: 1,
        }}
      >
        {filteredAppointments.map((appointment) =>
          renderAppointmentItem(appointment)
        )}
      </Box>
    );
  };

  // Renderizar item de agendamento
  const renderAppointmentItem = (appointment: Appointment) => {
    const getStatusColor = () => {
      switch (appointment.status) {
        case "WAITING":
          return { bg: "#e3f2fd", border: "#2196f3", text: "#0d47a1" };
        case "IN_PROGRESS":
          return { bg: "#ede7f6", border: "#673ab7", text: "#311b92" };
        case "DONE":
          return { bg: "#e8f5e9", border: "#4caf50", text: "#1b5e20" };
        case "CANCELLED":
          return { bg: "#ffebee", border: "#f44336", text: "#b71c1c" };
        default:
          return { bg: "#f5f5f5", border: "#9e9e9e", text: "#212121" };
      }
    };

    const colors = getStatusColor();
    const isExaminationEligible = canJoinExamination(
      appointment.status,
      appointment.date,
      appointment.startTime,
      appointment.endTime
    );

    const getTooltipContent = () => {
      if (
        appointment.status !== "WAITING" &&
        appointment.status !== "IN_PROGRESS"
      ) {
        return "Só é possível participar quando o status for Aguardando ou Em atendimento";
      }

      const today = new Date();
      const appointmentDate = appointment.date.split("-").reverse().join("-");
      if (today.toISOString().split("T")[0] !== appointmentDate) {
        return "Só é possível participar no dia agendado";
      }

      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const [startHour, startMinute] = appointment.startTime
        .split(":")
        .map(Number);
      const startTimeInMinutes = startHour * 60 + startMinute;

      const [endHour, endMinute] = appointment.endTime.split(":").map(Number);
      const endTimeInMinutes = endHour * 60 + endMinute;

      if (currentTimeInMinutes < startTimeInMinutes) {
        return `Só é possível participar a partir de ${appointment.startTime}`;
      }

      if (currentTimeInMinutes > endTimeInMinutes) {
        return "O horário da consulta já passou";
      }

      return "Clique para entrar na sala de consulta";
    };

    return (
      <Tooltip
        key={appointment.id}
        title={
          <>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Ordem: {appointment.numericalOrder}
            </Typography>
            <Typography variant="body2">
              Médico: {appointment.doctorName}
            </Typography>
            <Typography variant="body2">
              Horário: {appointment.startTime} - {appointment.endTime}
            </Typography>
            <Typography variant="body2">
              Motivo: {appointment.reason || "Não informado"}
            </Typography>
            {!isExaminationEligible && (
              <Typography
                variant="body2"
                sx={{ color: "orange", fontWeight: "bold", mt: 1 }}
              >
                {getTooltipContent()}
              </Typography>
            )}
          </>
        }
        arrow
      >
        <Paper
          sx={{
            p: 1,
            mb: 1,
            backgroundColor: colors.bg,
            borderLeft: `4px solid ${colors.border}`,
            cursor: "pointer",
            "&:hover": {
              boxShadow: 1,
              opacity: 0.9,
            },
          }}
          onClick={() => handleAppointmentClick(appointment.workScheduleId)}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: colors.text }}
              >
                Ordem: {appointment.numericalOrder}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: colors.text, fontWeight: "medium" }}
              >
                Dr(a): {appointment.doctorName.split(" ").pop()}
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: colors.text }}
              >
                {appointment.startTime} - {appointment.endTime}
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", color: colors.text }}
              >
                {appointment.reason || "Sem motivo"}
              </Typography>
            </Box>

            {isExaminationEligible && (
              <IconButton
                size="small"
                color="primary"
                onClick={(e) =>
                  handleJoinExamination(
                    appointment.id,
                    appointment.workScheduleId,
                    appointment.date,
                    e,
                    appointment.doctorId,
                    appointment.doctorName,
                    appointment.numericalOrder
                  )
                }
                sx={{
                  bgcolor: "rgba(25, 118, 210, 0.1)",
                  "&:hover": { bgcolor: "rgba(25, 118, 210, 0.2)" },
                }}
              >
                <VideoCallIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Paper>
      </Tooltip>
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <CalendarMonthIcon sx={{ mr: 1, fontSize: 24 }} />
          {"Agendamentos"}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleBookingClick}
          disabled={showBooking}
        >
          {"Novo agendamento"}
        </Button>
      </Box>

      {showBooking ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <BookAppointment
            onClose={handleBookingClose}
            patientId={user.userId}
          />
        </Paper>
      ) : (
        <Paper sx={{ width: "100%", mb: 3 }}>
          <Box sx={{ p: 3 }}>
            {/* Navegação do calendário */}
            <Paper sx={{ mb: 3, p: 2 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                justifyContent="center"
              >
                <IconButton
                  onClick={handlePrevWeek}
                  aria-label="Semana anterior"
                >
                  <NavigateBeforeIcon />
                </IconButton>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" sx={{ textAlign: "center" }}>
                    {formatWeekRange()}
                    {isCurrentWeek() && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="primary"
                      >
                        Semana atual
                      </Typography>
                    )}
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleGoToCurrentWeek}
                      disabled={isCurrentWeek()}
                    >
                      Semana atual
                    </Button>

                    <Button
                      startIcon={<DateRangeIcon />}
                      variant="outlined"
                      size="small"
                      onClick={handleOpenCalendar}
                    >
                      Escolher data
                    </Button>
                  </Stack>
                </Stack>

                <IconButton
                  onClick={handleNextWeek}
                  aria-label="Próxima semana"
                >
                  <NavigateNextIcon />
                </IconButton>
              </Stack>
            </Paper>

            {/* Exibir calendário semanal */}
            <Paper sx={{ mb: 3, overflow: "auto" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: "bold", width: "100px" }}
                      ></TableCell>
                      {weekDays.map((day, index) => (
                        <TableCell
                          key={day.formattedDate}
                          align="center"
                          sx={{ fontWeight: "bold", minWidth: "150px" }}
                        >
                          {DAYS_OF_WEEK[index].label}
                          <Typography variant="body2" color="textSecondary">
                            {day.displayDate}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* Manhã */}
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Manhã</TableCell>
                      {weekDays.map((day) => (
                        <TableCell
                          key={`${day.formattedDate}-morning`}
                          align="center"
                          sx={{
                            p: 1,
                            alignItems: "center",
                          }}
                        >
                          {renderPeriodAppointments(
                            day.formattedDate,
                            TimePeriod.MORNING
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                    {/* Tarde */}
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Tarde</TableCell>
                      {weekDays.map((day) => (
                        <TableCell
                          key={`${day.formattedDate}-afternoon`}
                          align="center"
                          sx={{
                            p: 1,
                            alignItems: "center",
                          }}
                        >
                          {renderPeriodAppointments(
                            day.formattedDate,
                            TimePeriod.AFTERNOON
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Modal do calendário */}
            <Modal
              open={calendarOpen}
              onClose={handleCloseCalendar}
              aria-labelledby="modal-calendar"
              aria-describedby="modal-choose-date"
            >
              <Paper
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "auto",
                  maxWidth: "90%",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 2,
                  borderRadius: 1,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="h6" component="h2">
                    Escolher data
                  </Typography>
                  <IconButton onClick={handleCloseCalendar} size="small">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>

                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={vi}
                  localeText={
                    viVN.components.MuiLocalizationProvider.defaultProps
                      .localeText
                  }
                >
                  <DateCalendar
                    value={currentDate}
                    onChange={(newDate) => handleDateSelect(newDate as Date)}
                    sx={{ width: 320 }}
                  />
                </LocalizationProvider>

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button onClick={handleCloseCalendar}>Fechar</Button>
                </Box>
              </Paper>
            </Modal>

            <Box mt={2} display="flex" justifyContent="center">
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "#2196f3",
                      borderRadius: "50%",
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption">Aguardando</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "#4caf50",
                      borderRadius: "50%",
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption">Concluído</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "#f44336",
                      borderRadius: "50%",
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption">Cancelado</Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AppointmentPage;
