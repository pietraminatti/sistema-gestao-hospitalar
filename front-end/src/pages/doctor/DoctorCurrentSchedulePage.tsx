import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Stack,
  Modal,
  Button,
} from "@mui/material";
// Import DatePicker do MUI X
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { viVN } from "@mui/x-date-pickers/locales";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CloseIcon from "@mui/icons-material/Close";
import { ROUTING } from "../../constants/routing";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { vi } from "date-fns/locale";
import { formatDateToString, parseDateFromString } from "../../utils/dateUtils";

/**
 * DoctorCurrentSchedulePage - Página que exibe a agenda de trabalho do médico
 *
 * Fluxo de exibição dos turnos:
 * 1. Ao carregar a página, o sistema exibe a agenda da semana atual (começando na segunda-feira)
 * 2. Os dados da agenda são obtidos da API getWorkScheduleBetweenDate com o userId do médico
 *    e o intervalo da semana atual
 * 3. Os dados são convertidos e armazenados no estado scheduleMap, que é um mapa de datas (string)
 *    para listas de WorkSchedule[]
 * 4. A tabela exibe os turnos por período (manhã e tarde) para os 7 dias da semana:
 *    - Cada célula pode exibir vários turnos no mesmo período (manhã/tarde)
 *    - Os turnos são classificados por horário de início ou ID do turno
 * 5. Para cada dia e período:
 *    - Verifica se há turnos (hasShiftsForPeriod)
 *    - Se houver, exibe todos os turnos daquele período com quantidade de consultas e botão de ação
 *    - Se não houver, exibe "Sem turno"
 * 6. O usuário pode:
 *    - Navegar entre as semanas pelos botões
 *    - Selecionar um dia específico no calendário para ir à semana correspondente
 *    - Clicar no card do turno para ver detalhes das consultas
 *    - Clicar em "Atender" para iniciar o atendimento (apenas para hoje ou datas futuras)
 *
 * Observação: O status do turno é determinado por:
 * - Existência de turno para o dia e período
 * - Se a data já passou (isPastDate)
 * - Quantidade de consultas agendadas e total de vagas
 */

// Interface Shift - compatível com o modelo do banco de dados
interface Shift {
  id: number;
  shift: number;
  start: string; // LocalTime como string (HH:mm)
  end: string; // LocalTime como string (HH:mm)
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Interface Doctor - simplificada da API
interface Doctor {
  id: number;
  // Outros dados do médico, se necessário
}

// Interface WorkSchedule - compatível com o modelo do banco de dados
interface WorkSchedule {
  id: number;
  doctor: Doctor;
  shift: Shift;
  maxSlots: number;
  dateAppointment: string; // LocalDate como string (yyyy-MM-dd)
  createdAt?: string;
  updatedAt?: string;
  status: boolean;
  // Informações de agendamento
  totalBook?: number; // Quantidade de consultas agendadas
}

// Mapeamento de string de data (dd-MM-yyyy) para array de WorkSchedule
type ScheduleMap = Record<string, WorkSchedule[]>;

// Verifica se uma data já passou (para controlar o botão "Atender")
const isPastDate = (dateString: string): boolean => {
  const date = parseDateFromString(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Verifica se a data é exatamente hoje
const isExactDate = (dateString: string): boolean => {
  const date = parseDateFromString(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date.getTime() === today.getTime();
};

// Dias da semana com rótulo em PT-BR
const DAYS_OF_WEEK = [
  { key: "MONDAY", label: "Segunda" },
  { key: "TUESDAY", label: "Terça" },
  { key: "WEDNESDAY", label: "Quarta" },
  { key: "THURSDAY", label: "Quinta" },
  { key: "FRIDAY", label: "Sexta" },
  { key: "SATURDAY", label: "Sábado" },
  { key: "SUNDAY", label: "Domingo" },
];

const DoctorCurrentSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [today] = useState(new Date());

  // Estado para o início da semana atual (segunda-feira)
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(today, { weekStartsOn: 1 })
  );

  // Mapeamento de agenda
  const [scheduleMap, setScheduleMap] = useState<ScheduleMap>({});

  // Estado do modal do calendário
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  // Usuário logado
  const user = JSON.parse((localStorage.getItem("user") as string) || "{}");

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

  // Navegar para semana anterior
  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  // Navegar para próxima semana
  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  // Voltar para semana atual
  const handleGoToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
  };

  // Formatar intervalo da semana
  const formatWeekRange = () => {
    const weekEnd = addDays(currentWeekStart, 6);
    return `${format(currentWeekStart, "dd/MM/yyyy")} - ${format(
      weekEnd,
      "dd/MM/yyyy"
    )}`;
  };

  // Verifica se está na semana atual
  const isCurrentWeek = () => {
    const actualWeekStart = startOfWeek(today, { weekStartsOn: 1 }).getTime();
    return currentWeekStart.getTime() === actualWeekStart;
  };

  // Buscar dados da agenda
  const fetchScheduleData = async () => {
    if (!user?.userId) return;

    try {
      const startDate = format(currentWeekStart, "dd-MM-yyyy");
      const endDate = format(addDays(currentWeekStart, 6), "dd-MM-yyyy");
      const response = await getWorkScheduleBetweenDate(
        user.userId,
        startDate,
        endDate
      );
      const result = response.data.data || [];

      const newScheduleMap: ScheduleMap = {};

      result.forEach((i: any) => {
        const item = i.workSchedule;
        if (!item.dateAppointment) {
          console.error("Faltando data de agendamento:", item);
          return;
        }

        const dateFromAPI = item.dateAppointment;
        const shiftData = item.shift;

        const formatTimeString = (timeStr: string) => {
          if (timeStr.includes("-")) {
            return timeStr.split("-").slice(0, 2).join(":");
          }
          return timeStr;
        };

        const shift: Shift = {
          id: shiftData.id,
          shift: shiftData.shift,
          start: formatTimeString(shiftData.start),
          end: formatTimeString(shiftData.end),
          status: shiftData.status,
        };

        const totalBook = i?.detail?.information?.total_book ?? 0;

        const workSchedule: WorkSchedule = {
          id: item.id,
          doctor: item.doctor,
          shift: shift,
          maxSlots: item.maxSlots,
          dateAppointment: item.dateAppointment,
          status: item.status,
          totalBook: totalBook,
        };

        if (!newScheduleMap[dateFromAPI]) {
          newScheduleMap[dateFromAPI] = [];
        }
        newScheduleMap[dateFromAPI].push(workSchedule);
      });

      Object.keys(newScheduleMap).forEach((date) => {
        newScheduleMap[date].sort((a, b) => {
          const [hoursA, minutesA] = a.shift.start.split(":").map(Number);
          const [hoursB, minutesB] = b.shift.start.split(":").map(Number);

          if (hoursA !== hoursB) {
            return hoursA - hoursB;
          }
          return minutesA - minutesB;
        });
      });
      setScheduleMap(newScheduleMap);
    } catch (error) {
      console.error("Erro ao buscar agenda:", error);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, [currentWeekStart, user?.userId]);

  // Exibe status dos turnos de um período (manhã/tarde)
  const renderPeriodStatus = (date: string, period: TimePeriod) => {
    const shifts = getShiftsForPeriod(date, period);

    if (shifts.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
            py: 1,
          }}
        >
          <Chip
            label="Sem turno"
            size="small"
            variant="outlined"
            sx={{
              color: "text.disabled",
              borderColor: "text.disabled",
              fontSize: "0.75rem",
              width: "120px",
              height: "30px",
              justifyContent: "center",
            }}
          />
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
        }}
      >
        {shifts.map((shiftSchedule, index) => {
          const isDateInPast = isPastDate(date);

          const handleCardClick = (event: React.MouseEvent) => {
            if ((event.target as HTMLElement).closest("button")) {
              return;
            }
          };

          return (
            <Box
              key={`${date}-${shiftSchedule.id}`}
              onClick={handleCardClick}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                p: 1,
                gap: 1,
                borderRadius: 1,
                background:
                  "linear-gradient(to bottom, rgba(236, 246, 253, 0.3), rgba(236, 246, 253, 0.8))",
                border: "1px solid rgba(25, 118, 210, 0.12)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {/* Chip de consultas */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: "medium", color: "text.secondary" }}
                >
                  Consultas:
                </Typography>
                <Chip
                  label={`${shiftSchedule.totalBook}/${shiftSchedule.maxSlots}`}
                  size="small"
                  color="success"
                  sx={{
                    fontWeight: "bold",
                    height: "24px",
                    minWidth: "60px",
                  }}
                />
              </Box>

              {/* Botão Atender */}
              <Button
                variant="contained"
                size="small"
                color="success"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartExamination(shiftSchedule);
                }}
                disabled={isDateInPast}
                title={
                  isDateInPast ? "Não é possível atender datas passadas" : ""
                }
                sx={{
                  borderRadius: 2,
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  py: 0.5,
                  ...(isDateInPast && {
                    bgcolor: "grey.400",
                    opacity: 0.8,
                    cursor: "not-allowed",
                  }),
                }}
              >
                {isDateInPast ? "Passado" : "Atender"}
              </Button>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Abrir modal do calendário
  const handleOpenCalendar = () => {
    setCalendarOpen(true);
  };

  // Fechar modal do calendário
  const handleCloseCalendar = () => {
    setCalendarOpen(false);
  };

  // Selecionar data no calendário
  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    setCurrentWeekStart(weekStart);
    setCalendarOpen(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Título da página */}
      <Typography
        variant="h5"
        component="h1"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", mb: 2 }}
      >
        <CalendarMonthIcon sx={{ mr: 1, fontSize: 20 }} />
        Agenda Atual do Médico
      </Typography>

      {/* Alerta informativo */}
      <Box sx={{ mb: 2 }}>
        <Alert severity="info" sx={{ py: 0.5 }}>
          Esta é a agenda do médico. Você só pode visualizar, não pode editar
          diretamente.
        </Alert>
      </Box>

      {/* Navegação por semana */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          justifyContent="center"
        >
          <IconButton onClick={handlePrevWeek} aria-label="Semana anterior">
            <NavigateBeforeIcon />
          </IconButton>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              {formatWeekRange()}
              {isCurrentWeek() && (
                <Typography variant="caption" display="block" color="primary">
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

          <IconButton onClick={handleNextWeek} aria-label="Próxima semana">
            <NavigateNextIcon />
          </IconButton>
        </Stack>
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
              viVN.components.MuiLocalizationProvider.defaultProps.localeText
            }
          >
            <DateCalendar
              value={currentDate}
              onChange={(newDate) => handleDateSelect(newDate as Date)}
              sx={{ width: 320 }}
            />
          </LocalizationProvider>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseCalendar}>Fechar</Button>
          </Box>
        </Paper>
      </Modal>

      {/* Tabela da agenda semanal */}
      <Paper sx={{ mb: 3, overflow: "auto" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "100px" }}>
                  Turno
                </TableCell>

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
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Manhã</TableCell>

                {weekDays.map((day) => (
                  <TableCell
                    key={`${day.formattedDate}-morning`}
                    align="center"
                    sx={{ verticalAlign: "center", p: 1 }}
                  >
                    {renderPeriodStatus(day.formattedDate, TimePeriod.MORNING)}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Tarde</TableCell>

                {weekDays.map((day) => (
                  <TableCell
                    key={`${day.formattedDate}-afternoon`}
                    align="center"
                    sx={{ verticalAlign: "center", p: 1 }}
                  >
                    {renderPeriodStatus(
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
    </Box>
  );
};

export default DoctorCurrentSchedulePage;
