namespace MasterFind.SmokeTests;

[AttributeUsage(AttributeTargets.Method)]
public class TestPriorityAttribute : Attribute
{
    public int Priority { get; set; }
    public TestPriorityAttribute(int priority) => Priority = priority;
}
