---
title: Create your first Kotlin Notebook
---


:::info

   <p>
   This is the second part of the <strong>Getting started with Kotlin Notebook</strong> tutorial. Before proceeding, make sure you've completed the previous step.
   </p>
   <p>
   <img src="/img/icon-1-done.svg" width="20" alt="First step" style={{verticalAlign: 'middle'}}/> <a href="kotlin-notebook-set-up-env.md">Set up an environment</a><br/>
      <img src="/img/icon-2.svg" width="20" alt="Second step" style={{verticalAlign: 'middle'}}/> <strong>Create a Kotlin Notebook</strong><br/>
      <img src="/img/icon-3-todo.svg" width="20" alt="Third step" style={{verticalAlign: 'middle'}}/> Add dependencies to a Kotlin Notebook<br/>
   </p>

:::

Here, you will learn how to create your first [Kotlin Notebook](kotlin-notebook-overview.md), perform simple operations, and run code cells. 

## Create an empty project

1. In IntelliJ IDEA, select **File | New | Project**.
2. In the panel on the left, select **New Project**. 
3. Name the new project and change its location if necessary.

:::tip
    Select the **Create Git repository** checkbox to place the new project under version control. 
    You will be able to do it later at any time.

:::
   

4. From the **Language** list, select **Kotlin**.

   <img src="/img/new-notebook-project.png" width="700" alt="Create a new Kotlin Notebook project" style={{verticalAlign: 'middle'}}/>

5. Select the **IntelliJ** build system.
6. From the **JDK list**, select the [JDK](https://www.oracle.com/java/technologies/downloads/) that you want to use in your project.
7. Enable the **Add sample code** option to create a file with a sample `"Hello World!"` application.

:::tip
    You can also enable the **Generate code with onboarding tips** option to add some additional useful comments to your sample code.

:::
   

8. Click **Create**.

## Create a Kotlin Notebook

1. To create a new notebook, select **File | New | Kotlin Notebook**, or right-click on a folder and select **New | Kotlin Notebook**.

   <img src="/img/new-notebook.png" width="700" alt="Create a new Kotlin Notebook" style={{verticalAlign: 'middle'}}/>

2. Set the name of the new notebook, for example, **first-notebook**, and press **Enter**.
   A new tab with a Kotlin Notebook **first-notebook.ipynb** will open.
3. In the open tab, type the following code in the code cell:

   ```kotlin
   println("Hello, this is a Kotlin Notebook!")
   ```
4. To run a code cell, click the **Run Cell and Select Below** <img src="/img/run-cell-and-select-below.png" width="30" alt="Run Cell and Select Below" style={{verticalAlign: 'middle'}}/> button or press **Shift** + **Return**.
5. Add a markdown cell by clicking on the **Add Markdown Cell** button. 
6. Type `# Example operations` in the cell, and run it the same way you run code cells to render it.
7. In a new code cell, type `10 + 10` and run it.
8. Define a variable in a code cell. For example, `val a = 100`. 

:::tip
    Once you run a code cell with defined variables, those variables become accessible in all other code cells.

:::
   

9. Create a new code cell and add `println(a * a)`.
10. Run all code and markdown cells in the notebook using the **Run All** <img src="/img/run-all-button.png" width="30" alt="Run all button" style={{verticalAlign: 'middle'}}/> button.

    <img src="/img/first-notebook.png" width="700" alt="First notebook" style={{verticalAlign: 'middle'}}/>

Congratulations! You have just created your first Kotlin Notebook.

## Create a scratch Kotlin Notebook

Starting from IntelliJ IDEA 2024.1.1, you can also create a Kotlin Notebook as a scratch file.

[Scratch files](https://www.jetbrains.com/help/idea/scratches.html#create-scratch-file) allow 
you to test small pieces of code without creating a new project or modifying an existing one.

To create a scratch Kotlin Notebook:

1. Click **File | New | Scratch File**.
2. Select **Kotlin Notebook** from the **New Scratch File** list.

   <img src="/img/kotlin-notebook-scratch-file.png" width="400" alt="Scratch notebook" style={{verticalAlign: 'middle'}}/>

## Next step

In the next part of the tutorial, you will learn how to add dependencies to a Kotlin Notebook.

**[Proceed to the next chapter](kotlin-notebook-add-dependencies.md)**
