import streamlit as st
import errodocalculo
import sympy as sy


def formatar_variaveis(variaveis):
    variaveis = variaveis.replace(",", " ").replace(";", " ").replace("/", " ").strip()
    if " " not in variaveis:
        variaveis = " ".join(list(variaveis))
    return " ".join(variaveis.split())

st.set_page_config(page_title="Propagação de Incertezas", page_icon="📐", layout="wide")

# CSS personalizado
st.markdown("""
    <style>
    .main {padding: 2rem;}
    .stTextInput input {font-family: monospace;}
    .result-box {padding: 1rem; border-radius: 0.5rem; background: #2e2e2e;}
    .error-box {padding: 1rem; border-radius: 0.5rem; background: #4a0000;}
    .centered-title {text-align: center; font-size: 2.5rem !important;}
    </style>
""", unsafe_allow_html=True)


def main():
    st.markdown(
    '<h1 class="centered-title">📊 Calculadora de Propagação de Incertezas</h1>',
    unsafe_allow_html=True)

    st.markdown("---")
    
    with st.expander("ℹ️ Instruções de Uso", expanded=True):
        st.markdown("""
        1. Digite a função matemática usando apenas as variaveis (  ex: `f = t/c`)
        2. Liste as variáveis separadas por espaços (ex: `t c`) 
        3. Para cada variável, insira o valor no formato: **valor+-incerteza** (ex: `0.22+-0.04`)
        4. Clique em Calcular para ver os resultados
        """) 
        
        # corrigir problema com ponto na incerteza
    
    with st.container():
        col1, col2 = st.columns([2, 3])
        
        with col1:
            f = st.text_input("**Equação matemática:**", placeholder="Ex: f = t/c", help="preencha a equação matemática")
            variaveis = st.text_input("**Variáveis utilizadas:**", placeholder="Ex: t c", help="Preencha com as variaveis, separadas por espaço")

            # Inicializar session_state para valores
            if 'listadevalores' not in st.session_state:
                st.session_state.listadevalores = {}

            # Se existirem variáveis, mostrar o formulário com inputs dinâmicos
            if variaveis:
                with st.form("valores_form"):
                    variaveis = formatar_variaveis(variaveis)
                    variaveis_lista = variaveis.strip().split()
            
                # Criar inputs para cada variável
                for var in variaveis_lista:
                    valor = st.text_input(
                        f"Valor para **{var}**:",
                        value=st.session_state.listadevalores.get(var, ""),  # Mantém valores anteriores
                        placeholder=f"Ex: 65.8740±6e-4",
                        key=f"input_{var}",
                        help="Formato: valor±incerteza"
                    )
                    st.session_state.listadevalores[var] = valor
        
        # Botões dentro do formulário
        col1, col2 = st.columns(2)
        with col1:
            submitted = st.form_submit_button("🚀 Calcular")
        with col2:
            exemplo_btn = st.form_submit_button("📚 Carregar Exemplo")

        # with col2:
        #     # Seção de resultados
        #     if submitted or exemplo_btn:
        #         if exemplo_btn:
        #             load_example()
        #         else:
        #             process_calculation(f, variaveis, listadevalores)

#     # Seção de exemplo
#     with st.expander("📚 Exemplo Completo"):
#         st.markdown("""
#         **Função:**  
#         `f = t/c`  
        
#         **Variáveis:**  
#         `t c`  
        
#         **Valores:**  
#         - t = `65.8740±6e-4`  
#         - c = `2.2e-3±4e-4`  
        
#         **Resultado Esperado:**  
#         Valor da função: 5444.1322  
#         Incerteza: ± 989.1234
#         """)

# def load_example():
#     st.session_state.f = "f = t/c"
#     st.session_state.variaveis = "t c"
#     st.session_state.input_t = "65.8740±6e-4"
#     st.session_state.input_c = "2.2e-3±4e-4"

# def validate_inputs(f, variaveis, valores):
#     if not f or not variaveis:
#         raise ValueError("Preencha todos os campos obrigatórios")
    
#     if len(variaveis.split()) != len(valores):
#         raise ValueError("Número de valores não corresponde às variáveis")
    
#     for val in valores:
#         if "±" not in val:
#             raise ValueError(f"Formato inválido para valor: {val}. Use valor±incerteza")

# def process_calculation(f, variaveis, valores):
#     try:
#         # Validação de entrada
#         validate_inputs(f, variaveis, valores)
#         valores_erros = ' '.join(valores).replace(",", ".")
        
#         # Processamento
#         with st.spinner("🔍 Calculando..."):
#             resultado = errodocalculo.calculadoraerro(f, variaveis, valores_erros)
        
#         # Exibição de resultados
#         with st.container():
#             st.markdown("---")
#             st.subheader("📈 Resultados")
            
#             with st.expander("🔍 Detalhes Teóricos", expanded=True):
#                 col1, col2 = st.columns(2)
#                 with col1:
#                     st.markdown("**Equação Teórica**")
#                     st.latex(resultado[1])
#                 with col2:
#                     st.markdown("**Equação Substituída**")
#                     st.latex(resultado[0])
            
#             with st.container():
#                 col1, col2 = st.columns(2)
#                 with col1:
#                     st.markdown(f"**Valor da {resultado[4][0]}**")
#                     st.markdown(f"<div class='result-box'>{resultado[3]}</div>", unsafe_allow_html=True)
#                 with col2:
#                     st.markdown("**Incerteza Calculada**")
#                     st.markdown(f"<div class='result-box'>{resultado[2]}</div>", unsafe_allow_html=True)
        
#         st.success("✅ Cálculo concluído com sucesso!")
        
#     except Exception as e:
#         st.error(f"❌ Erro: {str(e)}")
#         st.markdown(f"<div class='error-box'>Verifique os dados de entrada e tente novamente</div>", unsafe_allow_html=True)

if __name__ == "__main__":
    main()