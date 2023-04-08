import streamlit as st
import errodocalulo


# f = "V = (((B+b)*h)/2)/T"
# variaveis = "B b h T"
# valores = "0.22+-0.04 0.44+-0.04 6.4+-0.4 1+-0.04"

# teste = errodocalculo.calculadoraerro(f,variaveis,valores)


f = st.text_input('Função')
variaveis = st.text_input('variaveis')
valores_erros = st.text_input('valores dos erros')

calcular  = st.button('Calular')

# f = "h = (((B+i)*h)/2)/T"
# variaveis = "B b h T"
# valores_erros = "0.22+-0.04 0.44+-0.04 6.4+-0.4 1+-0.04"

st.write("exemplo de como escrever")

st.write("Função:")
st.write("V = (((B+b)*h)/2)/T")

st.write("Variaveis envolvidas na derivada:")
st.write("B b h T")

st.write("Valores dos erros:")
st.write("0.22+-0.04 0.44+-0.04 6.4+-0.4 1+-0.04")

st.write("Notas: letra 'I' pode da problema como variavel!!!")
st.write("utilizar . e formatação do 'python'")

if calcular:
    derivada_pronta = errodocalulo.calculadoraerro(f,variaveis,valores_erros)[0]
    st.latex(derivada_pronta)
    code = derivada_pronta
    st.code(code, language='latex')

    derivada_teorica = errodocalulo.calculadoraerro(f,variaveis,valores_erros)[1]
    st.latex(derivada_teorica)
    code = derivada_teorica
    st.code(code, language='latex')





#retornar individualmente, derivada teorica, derivada editada, e derivada calculada

# else:
#     st.write('Goodbye')

# st.latex(r'''{}'''.format())
# st.write(1234)