using Xunit.Abstractions;
using Xunit.Sdk;

namespace MasterFind.SmokeTests;

public class PriorityOrderer : ITestCaseOrderer
{
    public IEnumerable<TTestCase> OrderTestCases<TTestCase>(IEnumerable<TTestCase> testCases)
        where TTestCase : ITestCase
    {
        var sorted = new SortedDictionary<int, List<TTestCase>>();

        foreach (var testCase in testCases)
        {
            var priority = testCase.TestMethod.Method
                .GetCustomAttributes(typeof(TestPriorityAttribute).AssemblyQualifiedName!)
                .FirstOrDefault()
                ?.GetNamedArgument<int>("Priority") ?? 0;

            if (!sorted.ContainsKey(priority))
                sorted[priority] = new List<TTestCase>();

            sorted[priority].Add(testCase);
        }

        return sorted.Values.SelectMany(list => list);
    }
}
