import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Controller, FormProvider, useFormContext, useFormState } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// Incluímos o Supabase
import { supabase } from "@/lib/supabaseClient";

const Form = FormProvider;

const FormFieldContext = React.createContext({});

const FormField = ({ ...props }) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

// Outras funções permanecem iguais...

// Adicionamos a função de submissão
const handleSubmit = async (data) => {
  const { error } = await supabase.from('projects').insert([data]);

  if (error) {
    console.error('Erro ao criar projeto:', error.message);
  } else {
    console.log('Projeto criado com sucesso!');
  }
};

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  handleSubmit // Exportamos a função
};
