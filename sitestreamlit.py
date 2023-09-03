import streamlit as st
import errodocalulo
import sympy as sy


st.title("Calculo da propagação da incerteza")

valores_erros = ''
f = st.text_input('Função:')
variaveis = st.text_input(f":red[Variavel:]")
variaveis2 = variaveis.replace(" ","")

#giy


if len(variaveis2)!=0:
    listadevalores= []
    for i in variaveis2:
        box_label = f'Valor da variaveil {i}:'
        box_value = st.text_input(box_label, key=i)
        listadevalores.append(box_value)


    valores_erros = ' '.join(str(e) for e in listadevalores)



if "," in valores_erros:
    valores_erros = valores_erros.replace(",",".")



# f = "V = (((B+b)*h)/2)/T"
# variaveis = "B b h T"
# valores = "0.22+-0.04 0.44+-0.04 6.4+-0.4 1+-0.04"


calcular  = st.button('Calular')


if calcular:
    # try:
        derivada_teorica = errodocalulo.calculadoraerro(f,variaveis,valores_erros)[1]
        st.subheader(':white[Equação teórica:]')
        st.latex(derivada_teorica)
        code = derivada_teorica
        st.code(code, language='latex')

        st.subheader(':white[Equação Substituída:]')
        derivada_pronta = errodocalulo.calculadoraerro(f,variaveis,valores_erros)[0]
        st.latex(derivada_pronta)
        code = derivada_pronta
        st.code(code, language='latex')

        
        derivada_valor_func = errodocalulo.calculadoraerro(f,variaveis,valores_erros)[3]
        st.subheader(':red[Valor de {} :]'.format(errodocalulo.calculadoraerro(f,variaveis,valores_erros)[4][0]))
        st.latex(derivada_valor_func)

        
        st.subheader(':red[Valor da propagação de incerteza:]')
        derivada_calculada = errodocalulo.calculadoraerro(f,variaveis,valores_erros)[2]
        st.latex(derivada_calculada)

        
    # except:
    #     st.subheader(':red[Verifique se todos os valores estão preenchidos]')
    
exemplo= st.button("Exemplo")
if exemplo:
    st.subheader(':white[Exemplo de como usar:]')
    
    st.subheader(':red[Função:]')
    st.text("f = t/c")

    st.subheader(':red[Variaveis envolvidas na derivada:]')
    st.text("t c")

    st.subheader(':red[Valores da variavel t:]')
    st.text("65.8740+-6*10**(-4)")

    st.subheader(':red[Valores da variavel c:]')
    st.text("2.2*10**(-3)+-4*10**(-4)")
    st.subheader(':red[Resposta:]')
    st.text("5444.13223823618")

valor_apenas_teorico =  st.button("Formula Latex")

if valor_apenas_teorico:
    try:
        derivada_teorica = errodocalulo.retorna_apenas_latex(f,variaveis)[1]
        

        st.subheader(':white[Equação teórica:]')
        st.latex(derivada_teorica)
        code = derivada_teorica
        st.code(code, language='latex')

        st.subheader(':white[Equação Substituída:]')
        derivada_pronta = errodocalulo.retorna_apenas_latex(f,variaveis)[0]
        st.latex(derivada_pronta)
        code = derivada_pronta
        st.code(code, language='latex')
    except:
        st.subheader(':red[Verifique se todos os valores estão preenchidos]')










