import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  updatePatientInfo,
  completeInfo,
} from "../../services/paciente/paciente";
import { useDispatch } from "react-redux";
import { setProfile } from "../../stores/slices/user.slice";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import { ApiError } from "../../types";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  isCompleting?: boolean;
  userData: {
    nome: string;
    sobrenome: string;
    cpf: string;
    email: string;
    telefone: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onClose,
  isCompleting,
  userData,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    cpf: userData.cpf || "",
    email: userData.email || "",
    nome: userData.nome || "",
    sobrenome: userData.sobrenome || "",
    telefone: userData.telefone || "",
    logradouro: userData.logradouro || "",
    numero: userData.numero || "",
    complemento: userData.complemento || "",
    bairro: userData.bairro || "",
    cidade: userData.cidade || "",
    estado: userData.estado || "",
    cep: userData.cep || "",
  };

  const validationSchema = Yup.object({
    nome: Yup.string().required("Nome é obrigatório"),
    sobrenome: Yup.string().required("Sobrenome é obrigatório"),
    telefone: Yup.string()
      .matches(/^[0-9]{10,11}$/, "Telefone inválido")
      .required("Telefone é obrigatório"),
    numero: Yup.string().required("Número é obrigatório"),
    cep: Yup.string().required("CEP é obrigatório"),
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const handleCEPChange = async (cep: string, setFieldValue: Function) => {
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      const data = response.data;
      if (!data.erro) {
        setFieldValue("logradouro", data.logradouro || "");
        setFieldValue("bairro", data.bairro || "");
        setFieldValue("cidade", data.localidade || "");
        setFieldValue("estado", data.uf || "");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.userId || user.id;

      const payload = {
        nome: `${values.nome} ${values.sobrenome}`.trim(),
        telefone: values.telefone,
        cep: values.cep,
        numero: values.numero,
        complemento: values.complemento,
      };

      const response = isCompleting
        ? await completeInfo(userId, values.cpf, values.email, payload)
        : await updatePatientInfo(userId, payload);

      if (response.data.status === 200) {
        const updatedUser = { ...user, ...response.data.data };
        dispatch(setProfile(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success(response.data.message);
        onClose();
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err.message);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={isCompleting ? undefined : onClose}
        disableEscapeKeyDown={isCompleting}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isCompleting ? "Completar Cadastro" : "Editar Perfil"}
        </DialogTitle>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="CPF"
                      name="cpf"
                      fullWidth
                      value={values.cpf}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email"
                      name="email"
                      fullWidth
                      value={values.email}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Nome"
                      name="nome"
                      fullWidth
                      value={values.nome}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.nome && Boolean(errors.nome)}
                      helperText={touched.nome && errors.nome}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      label="Sobrenome"
                      name="sobrenome"
                      fullWidth
                      value={values.sobrenome}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.sobrenome && Boolean(errors.sobrenome)}
                      helperText={touched.sobrenome && errors.sobrenome}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Telefone"
                      name="telefone"
                      fullWidth
                      value={values.telefone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.telefone && Boolean(errors.telefone)}
                      helperText={touched.telefone && errors.telefone}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="CEP"
                      name="cep"
                      fullWidth
                      value={values.cep}
                      onChange={(e) => {
                        handleChange(e);
                        if (e.target.value.length === 8) {
                          handleCEPChange(e.target.value, setFieldValue);
                        }
                      }}
                      onBlur={handleBlur}
                      error={touched.cep && Boolean(errors.cep)}
                      helperText={touched.cep && errors.cep}
                    />
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <TextField
                      label="Logradouro"
                      name="logradouro"
                      fullWidth
                      value={values.logradouro}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Número"
                      name="numero"
                      fullWidth
                      value={values.numero}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.numero && Boolean(errors.numero)}
                      helperText={touched.numero && errors.numero}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Complemento"
                      name="complemento"
                      fullWidth
                      value={values.complemento}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Bairro"
                      name="bairro"
                      fullWidth
                      value={values.bairro}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Cidade"
                      name="cidade"
                      fullWidth
                      value={values.cidade}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Estado"
                      name="estado"
                      fullWidth
                      value={values.estado}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                {!isCompleting && (
                  <Button onClick={onClose} disabled={loading || isSubmitting}>
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || isSubmitting}
                >
                  {loading ? <CircularProgress size={24} /> : "Salvar"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </>
  );
};
