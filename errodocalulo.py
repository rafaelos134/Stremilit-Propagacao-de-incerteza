import sympy as sy
from math import *
import re
import random

class trata_dados:
    def __init__(self,variavel_para_tratar = "lixo",separacao=' '):
       self.valor_separado = variavel_para_tratar.split(separacao)
       
    def remove_espacos(self):   
       espacos_removidos = [x.replace(" ", "") for x in self.valor_separado]
       return espacos_removidos

    def biblioteca_de_erros(self):
        biblioteca = {}
        for x in self.valor_separado:
          x= x.split('+-')
          biblioteca[x[0]] = x[1]
        
        return(biblioteca)
    
    def derivada(self, f,emrelacao):
        x = sy.diff(f,emrelacao)
        return x
    
    
    def sorteia_letra(separados):
        letra_aletorio = random.choice('abcdefghjklmnopqrstuvwxyz')
    
        if letra_aletorio in separados:
            while letra_aletorio in separados:
                letra_aletorio = random.choice('abcdefghjklmnopqrstuvwxyz')
                print("entrou")

        return (letra_aletorio)








class monta_derivadas:
    def __init__(self):
        self.lixo = "lixo"
        

    def raiz(self,raiz):
        return "({})**(1/2)".format(raiz)

    def sympify(self,valor):
        return sy.latex(sy.sympify(valor))
    
    def trata_str_latex(self,latex,f):
        edicao_final = []
        encontre = []
       
        for x in latex:
            edicao = re.sub(r"partial",r"\\partial", x)
            edicao = re.sub(r"\\Delta_",r"\\Delta ", edicao)  
            edicao = re.sub(r"partial_",r"partial ", edicao)
            try:
                encontre.append(re.findall(r"Delta.{8}", edicao)[0])
            except:
                pass
            edicao = re.sub(r"\\Delta.{8}",r" ", edicao) 
            edicao_final.append(edicao) 

        edicao = [edicao_final[x] +"({})".format(encontre[x]) for x in range (len(encontre)) ]

        edicao =  "+".join(edicao)
        edicao = re.sub(r"Delta",r"\\Delta", edicao)
        
        raiz = "(b)**(1/2)"
        derivada_antes = self.sympify(raiz)

        edicao = derivada_antes[:6] + edicao + derivada_antes[7:]

        edicao = "\Delta {} = {}".format(f,edicao)
    
        return edicao






   
    def derivadas_teorico(self,f,separados):
        derivada_antes = ["( partial_{} / partial_{})* (Delta_{})**2".format(f,separados[x],separados[x]) for x in range(len(separados)) ]
        derivada_antes = [self.sympify(x) for x in derivada_antes]
        # derivada_antes = "+".join(derivada_antes)
        # derivada_antes = self.raiz(derivada_antes)
        # derivada_antes = self.sympify(derivada_antes)
        derivada_antes = self.trata_str_latex(derivada_antes,f)
        return derivada_antes
        


 
    def derivadas_substituida(self,funcao_original,f,separados):
        derivada_pronta = ["((({})**2)*(Delta_{})**2)".format(f[x],separados[x],separados[x]) for x in range(len(separados))]
        derivada_pronta = [self.sympify(x) for x in derivada_pronta]
        derivada_pronta = self.trata_str_latex(derivada_pronta,funcao_original)

        return derivada_pronta





def calculadoraerro(f = False,variaveis_envolvidas = False,dados_dos_erros = False):
   
    if dados_dos_erros == False:
        pass
    else:
        dados_erros = trata_dados(dados_dos_erros)


    funcao_separada = trata_dados(f,'=')
    derivada_pronta = trata_dados()
    monta_derivada = monta_derivadas()

    variaveis_serparadas = trata_dados(variaveis_envolvidas)
    

    derivada_pronta = [derivada_pronta.derivada(funcao_separada.remove_espacos()[1],variaveis_serparadas.remove_espacos()[x]) for x in range(len(variaveis_serparadas.remove_espacos()))]
    
    derivada_substituida = monta_derivada.derivadas_substituida(funcao_separada.remove_espacos()[0],derivada_pronta,variaveis_serparadas.remove_espacos())

    derivada_teorica = monta_derivada.derivadas_teorico(funcao_separada.remove_espacos()[0],variaveis_serparadas.remove_espacos())
    

    return derivada_substituida , derivada_teorica
    

    #fazer codigo para obter somete latex 1 
    #obter somente erro
    #obter somente latex 2
    # print(derivadapronta)
 

f = "V = P/(2 * 3.14)"
variaveis = "V P"
valores_erros = "0.22+-0.04 0.44+-0.04"



