import React, { useState, useEffect } from "react";
import {
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Box,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Container,
} from "@mui/material";
import { AnimatedLine, LineChart } from "@mui/x-charts/LineChart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useChartId, useDrawingArea } from "@mui/x-charts";
import { getAgendamentosByPeriodo } from "../../services/consulta/agendamentos";

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Obtém informações do usuário do Redux store
  const user = useSelector((state: any) => state.user.user);

  // Estado para acompanhar o tipo de visualização de tempo selecionada (trimestre, mês ou ano)
  const [timeView, setTimeView] = useState<"quarter" | "month" | "year">(
    "quarter"
  );

  // Estados para dados do dashboard
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Record<string, number>>(
    {}
  );
  const [quarterlyRevenue, setQuarterlyRevenue] = useState<
    Record<string, number>
  >({});
  const [monthlyPatients, setMonthlyPatients] = useState<
    Record<string, number>
  >({});
  const [quarterlyPatients, setQuarterlyPatients] = useState<
    Record<string, number>
  >({});
  const [yearlyRevenue, setYearlyRevenue] = useState<Record<string, number>>(
    {}
  );
  const [yearlyPatients, setYearlyPatients] = useState<Record<string, number>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearComparison, setYearComparison] = useState({
    revenue: { current: 0, previous: 0 },
    patients: { current: 0, previous: 0 },
  });
  const [salaryPredictions, setSalaryPredictions] = useState<number[]>([]);

  // Busca dados do dashboard da API
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.userId) {
        setError("Não foi possível encontrar informações do usuário");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Buscar médicos ativos
        const medicosResp = await getAllMedicos(undefined, true);
        setTotalDoctors(medicosResp.data.length);

        // Buscar agendamentos do ano atual usando a API correta
        const anoAtual = new Date().getFullYear();
        const inicioAno = `${anoAtual}-01-01`;
        const fimAno = `${anoAtual}-12-31`;
        const agendamentosResp = await getAgendamentosByPeriodo(
          inicioAno,
          fimAno
        );
        const agendamentos = agendamentosResp.data || [];

        // Receita total e pacientes únicos do ano
        const receitaAno = agendamentos.reduce(
          (acc, ag) => acc + (ag.valorPago || 0),
          0
        );
        const pacientesAno = new Set(agendamentos.map((a) => a.codigoPaciente))
          .size;
        setYearComparison({
          revenue: { current: receitaAno, previous: 0 },
          patients: { current: pacientesAno, previous: 0 },
        });

        // Receita e pacientes por mês
        const receitaPorMes = {};
        const pacientesPorMes = {};
        for (let i = 1; i <= 12; i++) {
          receitaPorMes[String(i)] = 0;
          pacientesPorMes[String(i)] = new Set();
        }
        agendamentos.forEach((ag) => {
          if (ag.data) {
            const mes = new Date(ag.data).getMonth() + 1;
            receitaPorMes[String(mes)] += ag.valorPago || 0;
            pacientesPorMes[String(mes)].add(ag.codigoPaciente);
          }
        });
        setMonthlyRevenue(receitaPorMes);
        setMonthlyPatients(
          Object.fromEntries(
            Object.entries(pacientesPorMes).map(([k, v]) => [k, v.size])
          )
        );

        // Receita e pacientes por trimestre
        const receitaPorTrimestre = { T1: 0, T2: 0, T3: 0, T4: 0 };
        const pacientesPorTrimestre = {
          T1: new Set(),
          T2: new Set(),
          T3: new Set(),
          T4: new Set(),
        };
        agendamentos.forEach((ag) => {
          if (ag.data) {
            const mes = new Date(ag.data).getMonth() + 1;
            const trimestre = `T${Math.ceil(mes / 3)}`;
            receitaPorTrimestre[trimestre] += ag.valorPago || 0;
            pacientesPorTrimestre[trimestre].add(ag.codigoPaciente);
          }
        });
        setQuarterlyRevenue(receitaPorTrimestre);
        setQuarterlyPatients(
          Object.fromEntries(
            Object.entries(pacientesPorTrimestre).map(([k, v]) => [k, v.size])
          )
        );

        // Receita e pacientes por ano (últimos 5 anos)
        const receitaPorAno = {};
        const pacientesPorAno = {};
        agendamentos.forEach((ag) => {
          if (ag.data) {
            const ano = new Date(ag.data).getFullYear();
            if (!receitaPorAno[ano]) receitaPorAno[ano] = 0;
            if (!pacientesPorAno[ano]) pacientesPorAno[ano] = new Set();
            receitaPorAno[ano] += ag.valorPago || 0;
            pacientesPorAno[ano].add(ag.codigoPaciente);
          }
        });
        setYearlyRevenue(receitaPorAno);
        setYearlyPatients(
          Object.fromEntries(
            Object.entries(pacientesPorAno).map(([k, v]) => [k, v.size])
          )
        );

        setError(null);
      } catch (err) {
        setError("Não foi possível carregar os dados do painel");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Formata moeda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Formata quantidade de pacientes
  const formatPatientCount = (count: number): string => {
    return new Intl.NumberFormat("pt-BR").format(count);
  };

  // Lida com mudança de visualização de tempo
  const handleTimeViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeView: "quarter" | "month" | "year" | null
  ) => {
    if (newTimeView !== null) {
      setTimeView(newTimeView);
    }
  };

  // Lida com clique no item do gráfico
  const handleChartItemClick = (value: string) => {
    if (value !== undefined) {
      console.log(`Navegando para: /admin/doctor-revenue/${timeView}/${value}`);
      navigate(`/admin/doctor-revenue/${timeView}/${value}`);
    }
  };

  // Configuração do gráfico de receita
  const getRevenueChartConfig = () => {
    switch (timeView) {
      case "month": {
        const monthNames = [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
        ];
        const months = Array.from({ length: 12 }, (_, i) => String(i + 1));

        return {
          xAxisData: monthNames,
          seriesData: months.map((month) => monthlyRevenue[month] || 0),
          title: "Receita por mês no ano",
        };
      }
      case "quarter": {
        const quarters = ["T1", "T2", "T3", "T4"];

        return {
          xAxisData: quarters,
          seriesData: quarters.map((quarter) => quarterlyRevenue[quarter] || 0),
          title: "Receita por trimestre no ano",
        };
      }
      case "year": {
        const years = Object.keys(yearlyRevenue)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .slice(0, 5);

        const predictionYears = [];
        const lastYear =
          years.length > 0
            ? parseInt(years[years.length - 1])
            : new Date().getFullYear();

        for (let i = 1; i <= 3; i++) {
          predictionYears.push(String(lastYear + i));
        }

        const allYears = [...years, ...predictionYears];
        const combinedData = [
          ...years.map((year) => yearlyRevenue[year] || 0),
          ...Array.from({ length: 3 }, (_, i) => salaryPredictions[i] || 0),
        ];

        const isPrediction = [
          ...Array(years.length).fill(false),
          ...Array(predictionYears.length).fill(true),
        ];

        const predictionLimit = years.length;

        return {
          xAxisData: allYears,
          seriesData: combinedData,
          isPrediction: isPrediction,
          predictionLimit: predictionLimit,
          title: "Receita por ano (últimos anos + 3 anos previstos)",
          actualYearsCount: years.length,
        };
      }
      default:
        return {
          xAxisData: [],
          seriesData: [],
          isPrediction: [],
          title: "",
          actualYearsCount: 0,
        };
    }
  };

  // Configuração do gráfico de pacientes
  const getPatientsChartConfig = () => {
    switch (timeView) {
      case "month": {
        const monthNames = [
          "Jan",
          "Fev",
          "Mar",
          "Abr",
          "Mai",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Out",
          "Nov",
          "Dez",
        ];
        const months = Array.from({ length: 12 }, (_, i) => String(i + 1));

        return {
          xAxisData: monthNames,
          seriesData: months.map((month) => monthlyPatients[month] || 0),
          title: "Pacientes por mês no ano",
        };
      }
      case "quarter": {
        const quarters = ["T1", "T2", "T3", "T4"];

        return {
          xAxisData: quarters,
          seriesData: quarters.map(
            (quarter) => quarterlyPatients[quarter] || 0
          ),
          title: "Pacientes por trimestre no ano",
        };
      }
      case "year": {
        const years = Object.keys(yearlyPatients)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .slice(0, 5);

        return {
          xAxisData: years,
          seriesData: years.map((year) => yearlyPatients[year] || 0),
          title: "Pacientes por ano (últimos 5 anos)",
        };
      }
      default:
        return { xAxisData: [], seriesData: [], title: "" };
    }
  };

  // Componente de linha animada customizada
  function CustomAnimatedLine(props: CustomAnimatedLineProps) {
    const { limit, ...other } = props;
    const { top, bottom, height, left, width } = useDrawingArea();
    const chartId = useChartId();

    if (limit === undefined) {
      return <AnimatedLine {...other} />;
    }

    const totalItems = revenueChartConfig.xAxisData.length;
    const positionRatio = limit / totalItems;
    const dividerPosition = left + width * positionRatio;

    const clipIdleft = `${chartId}-${props.ownerState.id}-line-limit-${limit}-1`;
    const clipIdRight = `${chartId}-${props.ownerState.id}-line-limit-${limit}-2`;

    return (
      <React.Fragment>
        {/* Linha divisória para previsão */}
        {/* <line
					x1={dividerPosition}
					y1={top}
					x2={dividerPosition}
					y2={top + height}
					stroke="#888"
					strokeWidth={1}
					strokeDasharray="3,3"
				/> */}

        <clipPath id={clipIdleft}>
          <rect
            x={left}
            y={0}
            width={dividerPosition - left}
            height={top + height + bottom}
          />
        </clipPath>

        <clipPath id={clipIdRight}>
          <rect
            x={dividerPosition}
            y={0}
            width={left + width - dividerPosition}
            height={top + height + bottom}
          />
        </clipPath>

        <g clipPath={`url(#${clipIdleft})`} className="line-before">
          <AnimatedLine {...other} />
        </g>

        <g clipPath={`url(#${clipIdRight})`} className="line-after">
          <AnimatedLine {...other} strokeDasharray="5,5" strokeWidth={3} />
        </g>
      </React.Fragment>
    );
  }

  const revenueChartConfig = getRevenueChartConfig();
  const patientsChartConfig = getPatientsChartConfig();

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        Painel Administrativo
      </Typography>

      {/* Cards de resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Card Receita Total */}
        <Grid item xs={12} sm={6} md={6}>
          <Card
            sx={{ height: "100%", bgcolor: "primary.light", color: "white" }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoneyIcon sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h5" component="div">
                  Receita deste ano
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {formatCurrency(yearComparison.revenue.current)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Ano {new Date().getFullYear()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card Total de Pacientes */}
        <Grid item xs={12} sm={6} md={6}>
          <Card
            sx={{ height: "100%", bgcolor: "success.light", color: "white" }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <PeopleIcon sx={{ fontSize: 40, mr: 1 }} />
                <Typography variant="h5" component="div">
                  Pacientes deste ano
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold">
                {formatPatientCount(yearComparison.patients.current)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Ano {new Date().getFullYear()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Botão de alternância de período */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <ToggleButtonGroup
          value={timeView}
          exclusive
          onChange={handleTimeViewChange}
          aria-label="visualização de tempo"
          size="small"
        >
          <ToggleButton value="quarter" aria-label="visualização por trimestre">
            Trimestre
          </ToggleButton>
          <ToggleButton value="month" aria-label="visualização por mês">
            Mês
          </ToggleButton>
          <ToggleButton value="year" aria-label="visualização por ano">
            Ano
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Gráficos lado a lado */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Gráfico de Receita */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              {revenueChartConfig.title}
            </Typography>
            <Box sx={{ height: 350, width: "100%" }}>
              <LineChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: revenueChartConfig.xAxisData,
                    tickLabelStyle: { fontSize: 12, fontWeight: 600 },
                  },
                ]}
                series={[
                  {
                    data: revenueChartConfig.seriesData,
                    label: "Receita (BRL)",
                    color: "#2196f3",
                    ...(timeView === "year" && {
                      valueFormatter: (value, context) => {
                        if (
                          context &&
                          revenueChartConfig.isPrediction &&
                          revenueChartConfig.isPrediction[context.dataIndex]
                        ) {
                          return `${formatCurrency(value)} (Previsto)`;
                        }
                        return formatCurrency(value);
                      },
                    }),
                  },
                ]}
                height={320}
                width={500}
                margin={{ left: 100, right: 20 }}
                tooltip={{
                  trigger: "item",
                  valueFormatter: (value) =>
                    value ? formatCurrency(value) : "Sem dados",
                }}
                slots={{
                  line: timeView === "year" ? CustomAnimatedLine : undefined,
                }}
                slotProps={{
                  legend: { hidden: false },
                  line:
                    timeView === "year"
                      ? { limit: revenueChartConfig.predictionLimit }
                      : undefined,
                }}
                sx={{
                  cursor: "pointer",
                }}
                onAxisClick={(event, d) => {
                  if (
                    d &&
                    d.dataIndex !== undefined &&
                    timeView === "year" &&
                    d.dataIndex < revenueChartConfig.actualYearsCount
                  ) {
                    handleChartItemClick(d.axisValue);
                  } else if (
                    d &&
                    d.dataIndex !== undefined &&
                    timeView !== "year"
                  ) {
                    handleChartItemClick(d.axisValue);
                  }
                }}
                onMarkClick={(event, d) => {
                  if (
                    d &&
                    d.dataIndex !== undefined &&
                    d.seriesId === "0" &&
                    timeView === "year" &&
                    d.dataIndex < revenueChartConfig.actualYearsCount
                  ) {
                    handleChartItemClick(d.axisValue);
                  } else if (
                    d &&
                    d.dataIndex !== undefined &&
                    d.seriesId === "0" &&
                    timeView !== "year"
                  ) {
                    handleChartItemClick(d.axisValue);
                  }
                }}
              />
              <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
                Clique no gráfico para ver detalhes da receita por médico
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Gráfico de Pacientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              {patientsChartConfig.title}
            </Typography>
            <Box sx={{ height: 350, width: "100%" }}>
              <LineChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: patientsChartConfig.xAxisData,
                    tickLabelStyle: { fontSize: 12, fontWeight: 600 },
                  },
                ]}
                series={[
                  {
                    data: patientsChartConfig.seriesData,
                    label: "Quantidade de pacientes",
                    color: "#4caf50",
                  },
                ]}
                height={320}
                width={500}
                margin={{ left: 70, right: 20 }}
                tooltip={{ trigger: "item" }}
                slotProps={{
                  legend: { hidden: false },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboardPage;
