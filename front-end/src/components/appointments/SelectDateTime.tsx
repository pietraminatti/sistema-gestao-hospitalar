import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Alert,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, addDays, isBefore, isToday } from "date-fns";
import {
  formatDateToString,
  formatTimeFromTimeString,
} from "../../utils/dateUtils";
import DoctorDetails from "./DoctorDetails"; // Importa o componente DoctorDetails

/**
 * Props para o componente SelectDateTime
 * @param doctor - Informações do médico selecionado
 * @param onSelect - Função callback quando o usuário seleciona data e turno
 * @param onBack - Função callback quando o usuário volta para o passo anterior
 */
interface SelectDateTimeProps {
  doctor: any;
  onSelect: (date: Date, shift: any, workScheduleTarget: object) => void;
  patientId?: string; // Adiciona prop patientId
  // onBack: () => void;
}

// Remove definição fixa de SHIFTS

/**
 * Componente que permite ao paciente escolher a data e o turno da consulta
 * Exibe o calendário para selecionar a data e os turnos disponíveis para aquele dia
 */
const SelectDateTime: React.FC<SelectDateTimeProps> = ({
  doctor,
  onSelect,
  patientId,
  // onBack,
}) => {
  // Estado para armazenar a data selecionada, padrão é a data atual
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Estado para armazenar o turno selecionado
  const [selectedShift, setSelectedShift] = useState<string>("");
  const [selectedShiftInfo, setSelectedShiftInfo] = useState<any>(null);

  // Estado para armazenar a lista de turnos disponíveis
  const [availableShifts, setAvailableShifts] = useState<
    {
      id: number;
      shift: string;
      start: string;
      end: string;
      isAvailable: boolean;
    }[]
  >([]);

  // Estado para o status de carregamento ao buscar dados
  const [loading, setLoading] = useState(false);

  // Estado para armazenar mensagens de erro
  const [error, setError] = useState<string | null>(null);

  // Estado para controlar se já existe agendamento
  const [hasExistingAppointment, setHasExistingAppointment] =
    useState<boolean>(false);

  // Estado para verificar se há agenda de trabalho no dia selecionado
  const [hasWorkSchedules, setHasWorkSchedules] = useState<boolean>(true);

  // Estado para armazenar informações da agenda de trabalho
  const [workSchedules, setWorkSchedules] = useState<any>(null);
  // Agenda selecionada
  const [workScheduleTarget, setWorkScheduleTarget] = useState<any>(null);

  /**
   * Chama a API para buscar os turnos disponíveis sempre que a data ou médico mudar
   */
  useEffect(() => {
    if (selectedDate && doctor) {
      fetchAvailableShifts(selectedDate);
    }
  }, [selectedDate, doctor]);

  /**
   * Função que chama a API para buscar a lista de turnos do médico por data
   * Foi ajustada para lidar de forma flexível com os turnos de trabalho conforme os dados da API
   * @param date - Data a ser verificada
   */
  const fetchAvailableShifts = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      setHasWorkSchedules(true); // Reseta o estado ao iniciar nova busca

      // Chama a API para obter informações da agenda do médico na data
      const result = await getWorkScheduleByDoctorAndExactDate(
        doctor.userId,
        formatDateToString(date)
      )
        .then((response) => response.data.data)
        .catch((error) => {
          console.log(error);
          return null;
        });
      // filtra agendas com status true
      const filteredResult = result.filter((item: any) => item.status === true);
      setWorkSchedules(filteredResult);

      // Verifica dados retornados pela API
      if (!result || !Array.isArray(result)) {
        setAvailableShifts([]);
        setHasWorkSchedules(false); // Não há agenda para este dia
        return;
      }

      // Verifica se há agenda para o dia selecionado
      if (result.length === 0) {
        setAvailableShifts([]);
        setHasWorkSchedules(false);
        return;
      }

      // Cria um map para agrupar agendas por id do turno
      const shiftsMap = new Map();

      // Agrupa agendas por id do turno
      filteredResult.forEach((item: any) => {
        if (!shiftsMap.has(item.shift.id)) {
          shiftsMap.set(item.shift.id, {
            id: item.shift.id,
            shift: `Turno ${item.shift.shift}`,
            start: item.shift.start,
            end: item.shift.end,
            isAvailable: true,
          });
        }
      });

      // Converte o map em array para exibição
      const shifts = Array.from(shiftsMap.values());

      setAvailableShifts(shifts);
    } catch (err) {
      console.error("Não foi possível obter a agenda do médico:", err);
      setError(
        "Não foi possível carregar os turnos disponíveis. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lida com a seleção de uma nova data
   * Reseta o turno selecionado e recarrega a lista de turnos
   * @param date - Nova data selecionada
   */
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedShift("");
  };

  /**
   * Lida com a seleção de um turno
   * @param shift - Turno selecionado
   * @param shiftInfo - Informações detalhadas do turno
   */
  const handleShiftSelect = async (shift: string, shiftInfo: any) => {
    // Busca e salva a agenda correspondente ao turno selecionado
    const shiftId = shiftInfo.id;
    const selectedWorkSchedule = workSchedules.find(
      (item: any) => item.shift.id === shiftId
    );

    // Verifica se o paciente já possui agendamento neste turno
    try {
      const response = await getAppointmentPatientDetail(
        patientId,
        selectedWorkSchedule.id
      );

      // Se a API retornar código 200, já existe agendamento
      if (response.data.code === 200) {
        setHasExistingAppointment(true);
        setError(
          "Você já possui um agendamento neste horário. Por favor, escolha outro horário."
        );
        return;
      }
    } catch (error) {
      // Se a API retornar erro, não há agendamento
      setHasExistingAppointment(false);
      setError(null);
    }

    setWorkScheduleTarget(selectedWorkSchedule);
    setSelectedShift(shift);
    setSelectedShiftInfo(shiftInfo);
  };

  /**
   * Lida com o clique no botão continuar
   * Chama o callback com a data e turno selecionados
   */
  const handleContinue = () => {
    if (selectedDate && selectedShift) {
      onSelect(selectedDate, selectedShiftInfo, workScheduleTarget);
    }
  };

  /**
   * Verifica se uma data deve ser desabilitada
   * Desabilita datas passadas e datas além de 30 dias a partir de hoje
   * @param date - Data a ser verificada
   * @returns true se a data deve ser desabilitada, senão false
   */
  const shouldDisableDate = (date: Date) => {
    const today = new Date();
    const maxDate = addDays(today, 30); // 30 dias a partir de hoje

    return (isBefore(date, today) && !isToday(date)) || isBefore(maxDate, date);
  };

  /**
   * Verifica se um turno deve ser desabilitado
   * Desabilita turnos já passados no dia atual ou que não estão disponíveis
   * @param shift - Turno a ser verificado
   * @returns true se o turno deve ser desabilitado, senão false
   */
  const isShiftDisabled = (shift: any) => {
    // Se o turno não está disponível, desabilita
    if (!shift.isAvailable) {
      return true;
    }

    // Só verifica horário para o dia atual
    if (!selectedDate || !isToday(selectedDate)) return false;

    const now = new Date();
    const shiftEndHour = parseInt(shift.end.split(":")[0]);

    // Desabilita turno se já passou do horário de término
    if (now.getHours() >= shiftEndHour) {
      return true;
    }

    return false;
  };

  return (
    <Box>
      {/* Título da página */}
      <Typography variant="h6" gutterBottom>
        Selecionar data e horário
      </Typography>

      {/* Inclui o componente DoctorDetails */}
      <Box sx={{ mb: 3 }}>
        <DoctorDetails doctor={doctor} />
      </Box>

      {/* Exibe mensagem de erro se houver */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Layout em grid: à esquerda o calendário, à direita os turnos */}
      <Grid container spacing={3}>
        {/* Seleção de data à esquerda */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Selecione a data
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar
                value={selectedDate}
                onChange={handleDateChange}
                disablePast
                shouldDisableDate={shouldDisableDate}
              />
            </LocalizationProvider>
          </Paper>
        </Grid>

        {/* Seleção de turno à direita */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom>
              Selecione o turno
            </Typography>

            {selectedDate && (
              <Box>
                {/* Exibe a data selecionada */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy")}
                </Typography>

                {/* Exibe loading ou lista de turnos */}
                {loading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", my: 4 }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <Stack spacing={2} sx={{ mb: 2, minHeight: "200px" }}>
                    {availableShifts.length > 0 ? (
                      // Exibe os turnos disponíveis
                      availableShifts.map((shift) => (
                        <Card
                          key={shift.id}
                          variant={
                            selectedShift === shift.shift
                              ? "outlined"
                              : "elevation"
                          }
                          sx={{
                            cursor: isShiftDisabled(shift)
                              ? "not-allowed"
                              : "pointer",
                            bgcolor:
                              selectedShift === shift.shift
                                ? "primary.50"
                                : "background.paper",
                            border:
                              selectedShift === shift.shift
                                ? "1px solid"
                                : "none",
                            borderColor: "primary.main",
                            opacity: isShiftDisabled(shift) ? 0.6 : 1,
                          }}
                          onClick={() =>
                            !isShiftDisabled(shift) &&
                            handleShiftSelect(shift.shift, shift)
                          }
                        >
                          <CardContent>
                            {/* Nome do turno */}
                            <Typography variant="h6" component="div">
                              {shift.shift}
                            </Typography>
                            {/* Horário do turno */}
                            <Typography variant="body2" color="text.secondary">
                              Horário:{" "}
                              {formatTimeFromTimeString(shift.start, "string")}{" "}
                              - {formatTimeFromTimeString(shift.end, "string")}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      // Exibe mensagem quando não há turnos disponíveis
                      <Typography
                        color="text.secondary"
                        sx={{ py: 3, textAlign: "center" }}
                      >
                        {!hasWorkSchedules
                          ? "O médico não possui agenda neste dia"
                          : "Não há horários disponíveis para este dia"}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Botões de navegação */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        {/* Botão voltar */}
        {/* <Button onClick={onBack}>Voltar</Button> */}
        {/* Botão continuar - desabilitado se não selecionou tudo ou já tem agendamento */}
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedDate || !selectedShift || hasExistingAppointment}
          onClick={handleContinue}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );
};

export default SelectDateTime;
