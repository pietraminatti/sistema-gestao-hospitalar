import React, { useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Price } from "../../types/price";

interface PriceFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (price: Partial<Price>) => void;
  price?: Price | null;
  mode: "add" | "edit";
  loading?: boolean;
}

const validationSchema = Yup.object({
  priceType: Yup.string()
    .required("Tipo de preço é obrigatório")
    .min(2, "Tipo de preço deve ter pelo menos 2 caracteres"),
  price: Yup.number()
    .required("Preço é obrigatório")
    .min(0, "Preço não pode ser negativo"),
});

const PriceForm: React.FC<PriceFormProps> = ({
  open,
  onClose,
  onSubmit,
  price,
  mode,
  loading = false,
}) => {
  // Usa o formik para gerenciar o estado e validação do formulário
  const formik = useFormik({
    initialValues: {
      priceType: "",
      price: 0,
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Atualiza os valores do formulário quando price ou mode mudam
  useEffect(() => {
    if (price && mode === "edit") {
      formik.setValues({
        priceType: price.priceType,
        price: price.price,
      });
    } else if (mode === "add") {
      formik.resetForm();
    }
  }, [price, mode]);

  // Lida com o fechamento do dialog e reseta o formulário
  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // Define o título e texto do botão baseado no modo
  const title =
    mode === "add" ? "Adicionar novo preço" : "Editar informações do preço";
  const buttonText = mode === "add" ? "Adicionar preço" : "Salvar alterações";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <TextField
            name="priceType"
            label="Tipo de preço"
            value={formik.values.priceType}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.priceType && Boolean(formik.errors.priceType)}
            helperText={formik.touched.priceType && formik.errors.priceType}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            name="price"
            label="Preço"
            type="number"
            value={formik.values.price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.price && Boolean(formik.errors.price)}
            helperText={formik.touched.price && formik.errors.price}
            fullWidth
            required
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">BRL</InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {buttonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PriceForm;
